package woorifisa.project.backend.domain.wallet.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.wallet.dto.request.WalletCreateRequest;
import woorifisa.project.backend.domain.banking.repository.AccountRefRepository;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingWalletDebitRequest;
import woorifisa.project.backend.domain.wallet.dto.request.ChargeWalletRequest;
import woorifisa.project.backend.domain.wallet.dto.response.WalletNextStep;
import woorifisa.project.backend.domain.wallet.dto.response.WalletStatusResponse;
import woorifisa.project.backend.domain.wallet.dto.response.WalletTransactionsResponse;
import woorifisa.project.backend.domain.wallet.entity.Wallet;
import woorifisa.project.backend.domain.wallet.entity.WalletTransaction;
import woorifisa.project.backend.domain.wallet.entity.enums.TransactionFlow;
import woorifisa.project.backend.domain.wallet.repository.WalletRepository;
import woorifisa.project.backend.domain.wallet.repository.WalletTransactionRepository;
import woorifisa.project.backend.global.corebanking.client.CoreBankingClient;
import woorifisa.project.backend.global.exception.CustomException;

import java.time.Duration;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.INVALID_SIZE_PARAM;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_ACCOUNT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_ALREADY_EXISTS;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_CREATE_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_IDEMPOTENCY_KEY_REQUIRED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_CHARGE_IN_PROGRESS;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_DEBIT_COMMUNICATION_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_DEBIT_LOOKUP_RETRY_INTERRUPTED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_TERMS_REQUIRED;

@Service
@RequiredArgsConstructor
public class WalletService {
    // 동일 멱등키 충전 요청의 중복 진행을 막는 처리중 락 키
    private static final String CHARGE_PROCESSING_KEY = "wallet:charge:processing:%s";
    // 동일 멱등키 충전 요청의 완료 결과를 재사용하기 위한 캐시 키 (같은 멱등키 재요청/중복 처리 차단)
    private static final String CHARGE_RESULT_KEY = "wallet:charge:result:%s";
    // 같은 출금 계좌(accountId)의 동시 차감을 막는 계좌 단위 락 키 (다른 멱등키라도 같은 출금 계좌 동시 처리 차단)
    private static final String ACCOUNT_DEBIT_PROCESSING_KEY = "account:debit:processing:%s";
    private static final String PROCESSING_VALUE = "1";
    private static final String DONE_VALUE = "DONE";
    private static final String WALLET_CHARGE_COUNTERPARTY = "월렛 충전";
    private static final Duration PROCESSING_TTL = Duration.ofMinutes(5);
    private static final Duration RESULT_TTL = Duration.ofMinutes(10);
    private static final long DEBIT_LOOKUP_RETRY_DELAY_MILLIS = 1000L;

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final AccountRefRepository accountRefRepository;
    private final CoreBankingClient coreBankingClient;
    private final StringRedisTemplate stringRedisTemplate;

    @Transactional(readOnly = true)
    public WalletTransactionsResponse findWalletTransactions(Long userId, Pageable pageable) {
        // size 상한(100)은 대량 조회로 인한 DB 부하 방지 (page/size 음수·0은 Spring MVC가 사전 차단)
        if (pageable.getPageSize() > 100) {
            throw new CustomException(INVALID_SIZE_PARAM);
        }
        Wallet wallet = walletRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new CustomException(WALLET_NOT_FOUND));
        // Slice 사용 — count 쿼리 없이 다음 페이지 존재 여부(hasNext)만 확인
        Slice<WalletTransaction> transactions = walletTransactionRepository
                .findAllByWallet_WalletIdOrderByCreatedAtDesc(wallet.getWalletId(), pageable);

        return WalletTransactionsResponse.from(wallet, transactions);
    }

    @Transactional
    public void chargeWallet(Long userId, String idempotencyKey, ChargeWalletRequest request) {
        // 헤더 누락 시 Spring 기본 400 대신 커스텀 응답을 내려주기 위해 서비스에서 검증
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new CustomException(WALLET_IDEMPOTENCY_KEY_REQUIRED);
        }

        // 이미 완료된 멱등키면 결과 캐시가 있으므로 재처리 없이 즉시 반환
        String resultKey = formatResultKey(idempotencyKey);
        if (stringRedisTemplate.opsForValue().get(resultKey) != null) {
            return;
        }

        // processingKey가 없을 때(acquired=true)만 락 획득 → 진행 중 중복 요청 차단
        String processingKey = formatProcessingKey(idempotencyKey);
        Boolean acquired = stringRedisTemplate.opsForValue().setIfAbsent(processingKey, PROCESSING_VALUE, PROCESSING_TTL);
        if (!Boolean.TRUE.equals(acquired)) {
            throw new CustomException(WALLET_CHARGE_IN_PROGRESS);
        }

        try {
            Wallet wallet = walletRepository.findByUser_UserId(userId)
                    .orElseThrow(() -> new CustomException(WALLET_NOT_FOUND));
            AccountRef accountRef = wallet.getUserAccount();
            if (accountRef == null || !accountRef.getHasAccount()) {
                throw new CustomException(WALLET_ACCOUNT_NOT_FOUND);
            }
            // 계좌에 대한 락 획득 메서드
            String accountProcessingKey = formatAccountProcessingKey(accountRef.getAccountId());
            Boolean accountLockAcquired = stringRedisTemplate.opsForValue()
                    .setIfAbsent(accountProcessingKey, PROCESSING_VALUE, PROCESSING_TTL);
            if (!Boolean.TRUE.equals(accountLockAcquired)) {
                throw new CustomException(WALLET_CHARGE_IN_PROGRESS);
            }

            try {
                // 멱등키를 external_request_id로 그대로 사용해 코어뱅킹 측 중복 처리도 방지
                CoreBankingWalletDebitRequest debitRequest = new CoreBankingWalletDebitRequest(
                        idempotencyKey,
                        accountRef.getCustomerId(),
                        accountRef.getAccountId(),
                        request.chargeAmount()
                );

                // 코어뱅킹 차감 요청 (통신 장애 시 결과 조회로 복구 시도)
                debitWithRecovery(debitRequest);
                // 차감 확정 후 월렛 잔액·거래내역 반영
                completeWalletCharge(wallet, request.chargeAmount());
                // 완료 마킹 - 이후 동일 멱등키 재요청 시 즉시 반환하기 위해 결과 캐시 저장
                stringRedisTemplate.opsForValue().set(resultKey, DONE_VALUE, RESULT_TTL);
            } finally {
                stringRedisTemplate.delete(accountProcessingKey);
            }
        } finally {
            // 성공·실패 관계없이 processingKey 해제해서 다음 요청이 락 획득 가능하도록
            stringRedisTemplate.delete(processingKey);
        }
    }

    @Transactional(readOnly = true)
    public WalletStatusResponse findWalletStatus(Long userId) {
        // 사용자의 월렛 소유 여부 체크
        if (walletRepository.findByUser_UserId(userId).isPresent()) {
            // 월렛이 있을 경우
            return new WalletStatusResponse(WalletNextStep.WALLET_HOME);
        }

        // 계좌는 있는데, 월렛은 없음 -> 약관동의 필요(월렛 생성)
        if (accountRefRepository.existsByUser_UserIdAndHasAccountTrue(userId)) {
            return new WalletStatusResponse(WalletNextStep.WALLET_TERMS);
        }

        // 월렛도 없고 계좌도 없는 경우 계좌 생성 필요
        return new WalletStatusResponse(WalletNextStep.CREATE_ACCOUNT);
    }

    private String formatProcessingKey(String idempotencyKey) {
        return String.format(CHARGE_PROCESSING_KEY, idempotencyKey);
    }

    private String formatResultKey(String idempotencyKey) {
        return String.format(CHARGE_RESULT_KEY, idempotencyKey);
    }

    private String formatAccountProcessingKey(Long accountId) {
        return String.format(ACCOUNT_DEBIT_PROCESSING_KEY, accountId);
    }

    // 코어뱅킹 차감 요청 + 장애 허용 (통신 장애 시 결과 조회 + 전체 2차 재시도)
    private void debitWithRecovery(CoreBankingWalletDebitRequest request) {
        // 1차 시도
        if (attemptDebitOrRecover(request)) {
            return;
        }
        // 2차 시도
        if (attemptDebitOrRecover(request)) {
            return;
        }
        throw new CustomException(WALLET_DEBIT_COMMUNICATION_FAILED);
    }

    // 차감 요청 시도 → 통신 장애면 결과 조회로 처리 여부 확인, 그 외 실패는 그대로 예외 전파
    private boolean attemptDebitOrRecover(CoreBankingWalletDebitRequest request) {
        try {
            coreBankingClient.debitWalletAccount(request);
            return true;
        } catch (CustomException exception) {
            if (!isDebitCommunicationFailure(exception)) {
                // 잔액 부족 등 정상 실패는 그대로 프론트에 응답
                throw exception;
            }
            // 통신 장애면 external_request_id 조회로 처리 완료 여부 확인
            return isDebitRequestExistsWithRetry(request.walletChargeRequestId());
        }
    }

    // 차감 시 발생하는 에러가 네트워크(통신) 에러인지 확인
    private boolean isDebitCommunicationFailure(CustomException exception) {
        return exception.getExceptionStatus() != null
                && WALLET_DEBIT_COMMUNICATION_FAILED.getCode()
                .equals(exception.getExceptionStatus().getCode());
    }

    // 차감 처리 결과 확인 API 요청 (1초 대기 후 재조회)
    private boolean isDebitRequestExistsWithRetry(String idempotencyKey) {
        if (coreBankingClient.existsWalletDebitRequest(idempotencyKey)) {
            return true;
        }
        waitBeforeDebitLookupRetry();
        return coreBankingClient.existsWalletDebitRequest(idempotencyKey);
    }

    // 차감 처리 결과 재확인을 위한 대기
    private void waitBeforeDebitLookupRetry() {
        try {
            Thread.sleep(DEBIT_LOOKUP_RETRY_DELAY_MILLIS);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new CustomException(WALLET_DEBIT_LOOKUP_RETRY_INTERRUPTED);
        }
    }

    private void completeWalletCharge(Wallet wallet, Integer chargeAmount) {
        // 월렛 잔액 증가
        wallet.charge(chargeAmount);
        // 월렛 사용자의 accountRef 잔액 차감
        wallet.getUserAccount().debit(chargeAmount);
        // 월렛 거래 내역 저장
        walletTransactionRepository.save(WalletTransaction.builder()
                .wallet(wallet)
                .transactionFlow(TransactionFlow.DEPOSIT)
                .counterparty(WALLET_CHARGE_COUNTERPARTY)
                .amount(chargeAmount)
                .build());
    }

    @Transactional
    public void createWallet(Long userId, WalletCreateRequest request) {
        if (!Boolean.TRUE.equals(request.termsAgreed())) {
            throw new CustomException(WALLET_TERMS_REQUIRED);
        }

        if (walletRepository.findByUser_UserId(userId).isPresent()) {
            throw new CustomException(WALLET_ALREADY_EXISTS);
        }

        try {
            createNewWallet(userId);
        } catch (DataIntegrityViolationException ignored) {
            throw new CustomException(WALLET_CREATE_FAILED);
        }
    }

    private void createNewWallet(Long userId) {
        AccountRef accountRef = accountRefRepository.findFirstByUser_UserIdAndHasAccountTrue(userId)
                .orElseThrow(() -> new CustomException(WALLET_ACCOUNT_NOT_FOUND));
        Wallet wallet = Wallet.builder()
                .user(accountRef.getUser())
                .userAccount(accountRef)
                .balance(0)
                .build();

        walletRepository.save(wallet);
    }
}
