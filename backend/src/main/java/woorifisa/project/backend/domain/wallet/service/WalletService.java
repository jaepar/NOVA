package woorifisa.project.backend.domain.wallet.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.wallet.dto.WalletChargeIdempotencyResult;
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

        // 충전에 필요한 wallet, 연결 계좌, 요청 식별자를 한 번에 묶어 이후 흐름에서 공유한다.
        WalletChargeContext context = createChargeContext(userId, idempotencyKey, request);

        // Redis 멱등성 상태를 먼저 잡아 같은 충전 요청이 중복 실행되지 않게 한다.
        WalletChargeIdempotencyResult idempotencyResult = startChargeOrGetExisting(context);

        // 이미 처리 중이거나 완료된 요청이면 여기서 예외 또는 성공 반환으로 끝낸다.
        if (isExistingChargeHandled(idempotencyResult, context)) {
            return;
        }

        // 새 요청만 Core Banking 차감과 지갑 DB 반영을 진행한다.
        executeNewCharge(context);

        // 충전 본처리는 끝났으므로 Redis 완료 기록 실패는 사용자 성공 응답을 막지 않는다.
        markChargeCompletedBestEffort(context);
    }

    private WalletChargeContext createChargeContext(Long userId, String idempotencyKey, ChargeWalletRequest request) {
        Wallet wallet = walletRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new CustomException(WALLET_NOT_FOUND));
        AccountRef accountRef = wallet.getUserAccount();
        if (accountRef == null) {
            throw new CustomException(WALLET_ACCOUNT_NOT_FOUND);
        }

        return new WalletChargeContext(
                userId,
                idempotencyKey,
                createWalletChargeRequestId(),
                wallet,
                accountRef,
                request.chargeAmount()
        );
    }

    private WalletChargeIdempotencyResult startChargeOrGetExisting(WalletChargeContext context) {
        return walletChargeIdempotencyService.startOrGet(
                context.userId(),
                context.idempotencyKey(),
                context.walletChargeRequestId(),
                context.accountId(),
                context.chargeAmount()
        );
    }

    private boolean isExistingChargeHandled(WalletChargeIdempotencyResult idempotencyResult, WalletChargeContext context) {
        if (idempotencyResult.isProcessing()) {
            throw new CustomException(WALLET_CHARGE_IN_PROGRESS);
        }
        if (!idempotencyResult.isCompleted()) {
            return false;
        }
        if (!idempotencyResult.matches(context.accountId(), context.chargeAmount())) {
            throw new CustomException(WALLET_IDEMPOTENCY_KEY_CONFLICT);
        }
        return true;
    }

    private void executeNewCharge(WalletChargeContext context) {
        try {
            debitLinkedAccount(context);
            persistWalletCharge(context);
        } catch (RuntimeException exception) {
            // 충전이 실패했으면 PROCESSING 키를 지워 같은 요청을 재시도할 수 있게 한다.
            clearIdempotencyAfterFailedCharge(context);
            throw exception;
        }
    }

    private void debitLinkedAccount(WalletChargeContext context) {
        walletAccountDebitService.debit(
                context.walletChargeRequestId(),
                context.customerId(),
                context.accountId(),
                context.chargeAmount()
        );
    }

    private void persistWalletCharge(WalletChargeContext context) {
        walletChargePersistenceService.completeWalletCharge(context.walletId(), context.chargeAmount());
    }

    private void clearIdempotencyAfterFailedCharge(WalletChargeContext context) {
        try {
            walletChargeIdempotencyService.fail(context.userId(), context.idempotencyKey());
        } catch (RuntimeException failException) {
            log.warn("Failed to clear wallet charge idempotency after charge failure. idempotencyKey={}",
                    context.idempotencyKey(), failException);
        }
    }

    private void markChargeCompletedBestEffort(WalletChargeContext context) {
        try {
            // The charge is already committed, so Redis completion is recorded on a best-effort basis.
            walletChargeIdempotencyService.complete(
                    context.userId(),
                    context.idempotencyKey(),
                    context.walletChargeRequestId(),
                    context.accountId(),
                    context.chargeAmount()
            );
        } catch (RuntimeException exception) {
            log.warn("Failed to mark wallet charge idempotency as completed. walletChargeRequestId={}",
                    context.walletChargeRequestId(), exception);
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

    private record WalletChargeContext(
            Long userId,
            String idempotencyKey,
            String walletChargeRequestId,
            Wallet wallet,
            AccountRef accountRef,
            Integer chargeAmount
    ) {

        private Long walletId() {
            return wallet.getWalletId();
        }

        private Long customerId() {
            return accountRef.getCustomerId();
        }

        private Long accountId() {
            return accountRef.getAccountId();
        }
    }
}
