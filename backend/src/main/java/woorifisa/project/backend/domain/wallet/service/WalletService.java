package woorifisa.project.backend.domain.wallet.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.wallet.dto.request.ChargeWalletRequest;
import woorifisa.project.backend.domain.wallet.dto.response.WalletTransactionsResponse;
import woorifisa.project.backend.domain.wallet.entity.Wallet;
import woorifisa.project.backend.domain.wallet.entity.WalletTransaction;
import woorifisa.project.backend.domain.wallet.repository.WalletRepository;
import woorifisa.project.backend.domain.wallet.repository.WalletTransactionRepository;
import woorifisa.project.backend.global.exception.CustomException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_ACCOUNT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_CHARGE_IN_PROGRESS;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_CHARGE_INVALID_REQUEST;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_IDEMPOTENCY_KEY_CONFLICT;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_IDEMPOTENCY_KEY_REQUIRED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_INVALID_CHARGE_AMOUNT;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_NOT_FOUND;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private static final DateTimeFormatter REQUEST_DATE_FORMAT = DateTimeFormatter.BASIC_ISO_DATE;

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final WalletAccountDebitService walletAccountDebitService;
    private final WalletChargePersistenceService walletChargePersistenceService;
    private final WalletChargeIdempotencyService walletChargeIdempotencyService;

    @Transactional(readOnly = true)
    public WalletTransactionsResponse findWalletTransactions(Long userId) {
        Wallet wallet = walletRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new CustomException(WALLET_NOT_FOUND));
        List<WalletTransaction> transactions = walletTransactionRepository.findAllByWallet_WalletIdOrderByCreatedAtDesc(wallet.getWalletId());

        return WalletTransactionsResponse.from(wallet, transactions);
    }

    public void chargeWallet(Long userId, String idempotencyKey, ChargeWalletRequest request) {
        validateChargeRequest(userId, idempotencyKey, request);
        Integer chargeAmount = request.chargeAmount();
        String walletChargeRequestId = createWalletChargeRequestId();
        Wallet wallet = walletRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new CustomException(WALLET_NOT_FOUND));
        AccountRef accountRef = wallet.getUserAccount();
        if (accountRef == null) {
            throw new CustomException(WALLET_ACCOUNT_NOT_FOUND);
        }

        // 같은 사용자의 동일 멱등 키 요청이 처리 중이거나 완료됐는지 먼저 확인한다.
        WalletChargeIdempotencyResult idempotencyResult = walletChargeIdempotencyService.startOrGet(
                userId,
                idempotencyKey,
                walletChargeRequestId,
                accountRef.getAccountId(),
                chargeAmount
        );

        if (idempotencyResult.isProcessing()) {
            throw new CustomException(WALLET_CHARGE_IN_PROGRESS);
        }
        if (idempotencyResult.isCompleted()) {
            if (!idempotencyResult.matches(accountRef.getAccountId(), chargeAmount)) {
                throw new CustomException(WALLET_IDEMPOTENCY_KEY_CONFLICT);
            }
            return;
        }

        try {
            // CoreBanking 계좌 차감이 확정되기 전에는 Cloud 월렛 잔액을 변경하지 않는다.
            walletAccountDebitService.debit(
                    walletChargeRequestId,
                    accountRef.getCustomerId(),
                    accountRef.getAccountId(),
                    chargeAmount
            );

            // 계좌 차감 성공 확인 후 월렛 잔액과 거래내역을 같은 트랜잭션에서 반영한다.
            walletChargePersistenceService.completeWalletCharge(wallet.getWalletId(), chargeAmount);
        } catch (RuntimeException exception) {
            try {
                walletChargeIdempotencyService.fail(userId, idempotencyKey);
            } catch (RuntimeException failException) {
                log.warn("월렛 충전 실패 후 멱등 키 정리에 실패했습니다. idempotencyKey={}", idempotencyKey, failException);
            }
            throw exception;
        }

        try {
            // 성공 완료 상태를 저장해 같은 요청의 재시도를 재처리 없이 성공 응답으로 복구한다.
            walletChargeIdempotencyService.complete(userId, idempotencyKey, walletChargeRequestId, accountRef.getAccountId(), chargeAmount);
        } catch (RuntimeException exception) {
            log.warn("월렛 충전 완료 후 멱등 상태 저장에 실패했습니다. walletChargeRequestId={}", walletChargeRequestId, exception);
        }
    }

    private void validateChargeRequest(Long userId, String idempotencyKey, ChargeWalletRequest request) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new CustomException(WALLET_IDEMPOTENCY_KEY_REQUIRED);
        }
        if (userId == null || request == null) {
            throw new CustomException(WALLET_CHARGE_INVALID_REQUEST);
        }
        if (request.chargeAmount() == null || request.chargeAmount() <= 0) {
            throw new CustomException(WALLET_INVALID_CHARGE_AMOUNT);
        }
    }

    private String createWalletChargeRequestId() {
        return "WCR-" + LocalDate.now().format(REQUEST_DATE_FORMAT) + "-" + UUID.randomUUID();
    }
}
