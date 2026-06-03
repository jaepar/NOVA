package woorifisa.project.backend.domain.banking.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.backend.global.corebanking.client.dto.request.CoreBankingPasswordVerifyRequest;
import woorifisa.project.backend.global.corebanking.client.dto.request.CoreBankingRecipientLookupRequest;
import woorifisa.project.backend.global.corebanking.client.dto.request.CoreBankingTransferRequest;
import woorifisa.project.backend.global.corebanking.client.dto.request.CoreBankingCreateAccountRequest;
import woorifisa.project.backend.global.corebanking.client.dto.response.CoreBankingCreateAccountResponse;
import woorifisa.project.backend.domain.banking.dto.request.AccountCreateRequest;
import woorifisa.project.backend.domain.banking.dto.request.AccountPasswordVerifyRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransferPreviewRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransferRequest;
import woorifisa.project.backend.domain.banking.dto.response.AccountCreateResponse;
import woorifisa.project.backend.domain.banking.dto.response.TransferPreviewResponse;
import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.banking.repository.AccountRefRepository;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.CertificateStatus;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.corebanking.client.CoreBankingClient;
import woorifisa.project.backend.global.exception.CustomException;

import java.time.Duration;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_ACCOUNT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_CORE_BANKING_COMMUNICATION_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_REQUEST_LOOKUP_RETRY_INTERRUPTED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_TRANSFER_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_TRANSFER_PROCESSING;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_RECIPIENT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_CERTIFICATE_REQUIRED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.USER_NOT_FOUND;

@Service
@Slf4j
@RequiredArgsConstructor
public class BankingService {
    // 동일 멱등키 이체 요청의 완료 결과를 재사용하기 위한 캐시 키
    private static final String TRANSFER_RESULT_KEY = "banking:transfer:result:%s";
    // 동일 멱등키 이체 요청의 중복 진행을 막는 처리중 락 키 (같은 멱등키 재요청/중복 처리 차단)
    private static final String TRANSFER_PROCESSING_KEY = "banking:transfer:processing:%s";
    // 같은 출금 계좌(accountId)의 동시 차감을 막는 계좌 단위 락 키 (다른 멱등키라도 같은 출금 계좌 동시 처리 차단)
    private static final String ACCOUNT_DEBIT_PROCESSING_KEY = "account:debit:processing:%s";
    private static final String TRANSFER_DONE_VALUE = "DONE";
    private static final String PROCESSING_VALUE = "1";
    private static final Duration PROCESSING_TTL = Duration.ofMinutes(5);
    private static final Duration RESULT_TTL = Duration.ofMinutes(10);
    private static final long REQUEST_LOOKUP_RETRY_DELAY_MILLIS = 1000L;

    private final AccountRefRepository accountRefRepository;
    private final UserRepository userRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private final CoreBankingClient coreBankingClient;

    @Transactional
    public AccountCreateResponse createAccount(Long userId, AccountCreateRequest request) {
        log.info("[banking_account_create:requested] userId={}, accountType={}, accountName={}, hasForeignTax={}",
                userId, request.accountType(), request.accountName(), request.hasForeignTax());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(USER_NOT_FOUND));
        // 계좌 개설은 인증서 발급 완료 사용자만 허용한다.
        if (user.getCertificateStatus() != CertificateStatus.ISSUED) {
            log.warn("[banking_account_create:rejected_certificate_status] userId={}, certificateStatus={}",
                    userId, user.getCertificateStatus());
            throw new CustomException(BANKING_CERTIFICATE_REQUIRED);
        }

        // 백엔드 사용자 정보를 포함해 코어뱅킹 계좌 개설 API를 호출한다.
        CoreBankingCreateAccountResponse created = coreBankingClient.createAccount(
                CoreBankingCreateAccountRequest.of(user, request)
        );
        log.info("[banking_account_create:core_banking_completed] userId={}, accountId={}",
                userId, created.accountId());

        // 코어뱅킹 계좌 식별자와 계좌 정보를 클라우드 account_ref에 동기화한다.
        AccountRef accountRef = AccountRef.builder()
                .user(user)
                .customerId(created.customerId())
                .accountId(created.accountId())
                .hasAccount(true)
                .accountName(created.accountName())
                .accountNumber(created.accountNumber())
                .balance(0)
                .hasLimit(true)
                .build();
        accountRefRepository.save(accountRef);
        log.info("[banking_account_create:completed] userId={}, accountId={}, maskedAccountNumber={}",
                userId, created.accountId(), maskAccountNumber(created.accountNumber()));

        return AccountCreateResponse.of(
                created.accountId(),
                "WOORI",
                created.accountNumber()
        );
    }

    private String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() < 4) {
            return "****";
        }
        return accountNumber.substring(0, 4) + "********";
    }

    @Transactional
    public void transfer(Long userId, String idempotencyKey, TransferRequest request) {
        // 프론트에서 전달받은 멱등키로 redis key 생성
        String resultKey = formatResultKey(idempotencyKey);
        String cachedResult = stringRedisTemplate.opsForValue().get(resultKey);
        if (cachedResult != null) {
            // 이미 있는 멱등키일 경우
            return;
        }

        // processingKey는 지금 누가 처리 중인지 락을 거는 역할 -> 진행 중 중복 차단
        String processingKey = formatProcessingKey(idempotencyKey);
        Boolean acquired = stringRedisTemplate.opsForValue().setIfAbsent(processingKey, PROCESSING_VALUE, PROCESSING_TTL);
        // acquired(true) : processingKey가 없음 / acquired(false) : processingKey가 이미 있음
        if (!Boolean.TRUE.equals(acquired)) {
            // 이미 같은 키에 대해서 처리 중이므로 예외 처리
            throw new CustomException(BANKING_TRANSFER_PROCESSING);
        }

        try {
            // 같은 계좌의 동일 이체를 막기 위한 락을 거는 로직
            AccountRef accountRef = accountRefRepository.findByUser_UserIdAndAccountId(userId, request.withdrawAccountId())
                    .orElseThrow(() -> new CustomException(BANKING_ACCOUNT_NOT_FOUND));
            String accountProcessingKey = formatAccountProcessingKey(accountRef.getAccountId());
            Boolean accountLockAcquired = stringRedisTemplate.opsForValue()
                    .setIfAbsent(accountProcessingKey, PROCESSING_VALUE, PROCESSING_TTL);
            if (!Boolean.TRUE.equals(accountLockAcquired)) {
                throw new CustomException(BANKING_TRANSFER_PROCESSING);
            }

            try {
                // 이체 처리는 계좌에 대한 락을 얻은 뒤 처리
                CoreBankingTransferRequest coreBankingTransferRequest = CoreBankingTransferRequest.of(
                        createExternalRequestId(idempotencyKey),
                        accountRef.getAccountId(),
                        request
                );

                // Core Banking 한테 계좌 이체 요청
                transferWithRecovery(coreBankingTransferRequest);
                // 계좌 이체 시 cloud에 있는 db의 account_ref 잔액도 차감하여 데이터 동기화
                accountRef.debit(request.transferAmount());
                stringRedisTemplate.opsForValue().set(resultKey, TRANSFER_DONE_VALUE, RESULT_TTL);
            } finally {
                stringRedisTemplate.delete(accountProcessingKey);
            }
        } finally {
            stringRedisTemplate.delete(processingKey);
        }
    }

    public TransferPreviewResponse previewTransfer(Long userId, TransferPreviewRequest request) {
        AccountRef myAccount = accountRefRepository.findFirstByUser_UserIdAndHasAccountTrueOrderByAccountRefIdAsc(userId)
                .orElseThrow(() -> new CustomException(BANKING_ACCOUNT_NOT_FOUND));

        String recipientName = coreBankingClient.lookupRecipient(
                        CoreBankingRecipientLookupRequest.of(request.recipientBankCode(), request.recipientAccountNumber()))
                .recipientName();

        if (recipientName == null || recipientName.isBlank()) {
            throw new CustomException(BANKING_RECIPIENT_NOT_FOUND);
        }

        return TransferPreviewResponse.of(
                myAccount.getAccountName(),
                myAccount.getAccountNumber(),
                recipientName
        );
    }

    public void verifyAccountPassword(Long userId, AccountPasswordVerifyRequest request) {
        accountRefRepository.findByUser_UserIdAndAccountId(userId, request.accountId())
                .orElseThrow(() -> new CustomException(BANKING_ACCOUNT_NOT_FOUND));

        coreBankingClient.verifyAccountPassword(
                CoreBankingPasswordVerifyRequest.of(request.accountId(), request.accountPassword())
        );
    }

    // ProcessingKey 생성 메서드
    private String formatProcessingKey(String idempotencyKey) {
        return String.format(TRANSFER_PROCESSING_KEY, idempotencyKey);
    }

    // ResultKey 생성 메서드
    private String formatResultKey(String idempotencyKey) {
        return String.format(TRANSFER_RESULT_KEY, idempotencyKey);
    }

    private String formatAccountProcessingKey(Long accountId) {
        return String.format(ACCOUNT_DEBIT_PROCESSING_KEY, accountId);
    }

    // external_request_id 생성 메서드 (멱등키 그대로 사용)
    private String createExternalRequestId(String idempotencyKey) {
        return idempotencyKey;
    }

    // 코어 뱅킹에게 계좌 이체 요청 + 장애 허용(이체 처리 결과 조회 + 재시도)
    private void transferWithRecovery(CoreBankingTransferRequest request) {
        // 1차 시도 (성공/복구되면 종료)
        if (attemptTransferOrRecover(request)) {
            return;
        }

        // 2차 시도 (성공/복구되면 종료)
        if (attemptTransferOrRecover(request)) {
            return;
        }

        // 정상 실패가 아닌 비정상 실패가 2차 통신까지 전부 실패한다면 계좌 이체 실패 처리
        throw new CustomException(BANKING_TRANSFER_FAILED);
    }

    // 재시도 로직
    private boolean attemptTransferOrRecover(CoreBankingTransferRequest request) {
        try {
            coreBankingClient.transfer(request);
            return true;
        } catch (CustomException exception) {
            if (!isCoreBankingCommunicationFailure(exception)) {
                // 코어 뱅킹과의 통신 장애가 아니라면 -> 실패 응답은 그대로 프론트에게 응답
                throw exception;
            }
            // 통신 장애면 external_request_id 조회로 처리 완료 여부를 확인한다.
            return isTransferRequestExistsWithRetry(request.externalRequestId());
        }
    }

    // 계좌 이체 시 발생하는 에러가 네트워크(통신) 에러인지 확인하는 메서드
    private boolean isCoreBankingCommunicationFailure(CustomException exception) {
        return exception.getExceptionStatus() != null
                && BANKING_CORE_BANKING_COMMUNICATION_FAILED.getCode()
                .equals(exception.getExceptionStatus().getCode());
    }

    // 이체 처리 결과 확인 API 요청
    private boolean isTransferRequestExistsWithRetry(String externalRequestId) {
        if (coreBankingClient.existsTransferRequest(externalRequestId)) {
            return true;
        }
        waitBeforeRequestLookupRetry();
        return coreBankingClient.existsTransferRequest(externalRequestId);
    }

    // 이체 처리 결과 재확인 하기 위해 몇 초 대기
    private void waitBeforeRequestLookupRetry() {
        try {
            Thread.sleep(REQUEST_LOOKUP_RETRY_DELAY_MILLIS);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new CustomException(BANKING_REQUEST_LOOKUP_RETRY_INTERRUPTED);
        }
    }
}
