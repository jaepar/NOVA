package woorifisa.project.backend.domain.wallet.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.test.util.ReflectionTestUtils;
import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.wallet.dto.request.ChargeWalletRequest;
import woorifisa.project.backend.domain.wallet.dto.response.WalletTransactionsResponse;
import woorifisa.project.backend.domain.wallet.entity.Wallet;
import woorifisa.project.backend.domain.wallet.entity.WalletTransaction;
import woorifisa.project.backend.domain.wallet.entity.enums.TransactionFlow;
import woorifisa.project.backend.domain.wallet.repository.WalletRepository;
import woorifisa.project.backend.domain.wallet.repository.WalletTransactionRepository;
import woorifisa.project.backend.global.exception.CustomException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_ACCOUNT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_CHARGE_IN_PROGRESS;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_CHARGE_INVALID_REQUEST;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_DEBIT_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_IDEMPOTENCY_KEY_CONFLICT;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_IDEMPOTENCY_KEY_REQUIRED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_INVALID_CHARGE_AMOUNT;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_NOT_FOUND;

class WalletServiceTest {

    private final WalletRepository walletRepository = mock(WalletRepository.class);
    private final WalletTransactionRepository walletTransactionRepository = mock(WalletTransactionRepository.class);
    private final WalletAccountDebitService walletAccountDebitService = mock(WalletAccountDebitService.class);
    private final WalletChargePersistenceService walletChargePersistenceService = mock(WalletChargePersistenceService.class);
    private final WalletChargeIdempotencyService walletChargeIdempotencyService = mock(WalletChargeIdempotencyService.class);
    private final WalletService walletService = new WalletService(
            walletRepository,
            walletTransactionRepository,
            walletAccountDebitService,
            walletChargePersistenceService,
            walletChargeIdempotencyService
    );

    @Test
    @DisplayName("사용자 월렛 잔액과 거래내역을 최신순으로 조회한다")
    void found() {
        Long userId = 1L;
        Wallet wallet = Wallet.builder()
                .walletId(10L)
                .balance(12500)
                .build();
        WalletTransaction first = walletTransaction(101L, wallet, TransactionFlow.DEPOSIT, "월렛 충전", 10000, LocalDateTime.of(2025, 5, 24, 10, 30));
        WalletTransaction second = walletTransaction(102L, wallet, TransactionFlow.WITHDRAWAL, "이마트24 강남역점", 2500, LocalDateTime.of(2025, 5, 24, 14, 22));

        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.of(wallet));
        when(walletTransactionRepository.findAllByWallet_WalletIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(second, first));

        WalletTransactionsResponse response = walletService.findWalletTransactions(userId);

        assertThat(response.balance()).isEqualTo(12500);
        assertThat(response.transactions()).hasSize(2);
        assertThat(response.transactions().get(0).walletTransactionId()).isEqualTo(102L);
    }

    @Test
    @DisplayName("On-Prem 차감 성공 후 월렛 충전을 확정하고 멱등 상태를 완료로 변경한다")
    void success() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);
        AccountRef accountRef = AccountRef.builder().customerId(1001L).accountId(2001L).build();
        Wallet wallet = Wallet.builder().walletId(10L).balance(30000).userAccount(accountRef).build();

        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.of(wallet));
        when(walletChargeIdempotencyService.startOrGet(eq(1L), eq("idempotency-key"), any(), eq(2001L), eq(10000)))
                .thenAnswer(invocation -> WalletChargeIdempotencyResult.started(invocation.getArgument(2)));

        walletService.chargeWallet(1L, "idempotency-key", request);

        verify(walletAccountDebitService).debit(any(), eq(1001L), eq(2001L), eq(10000));
        verify(walletChargePersistenceService).completeWalletCharge(10L, 10000);
        verify(walletChargeIdempotencyService).complete(eq(1L), eq("idempotency-key"), any(), eq(2001L), eq(10000));
    }

    @Test
    @DisplayName("완료된 동일 멱등 요청이면 재처리하지 않고 성공 처리한다")
    void completed() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);
        AccountRef accountRef = AccountRef.builder().customerId(1001L).accountId(2001L).build();
        Wallet wallet = Wallet.builder().walletId(10L).balance(30000).userAccount(accountRef).build();

        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.of(wallet));
        when(walletChargeIdempotencyService.startOrGet(eq(1L), eq("idempotency-key"), any(), eq(2001L), eq(10000)))
                .thenReturn(WalletChargeIdempotencyResult.completed("WCR-20260525-0001", 2001L, 10000));

        walletService.chargeWallet(1L, "idempotency-key", request);

        verify(walletAccountDebitService, never()).debit(any(), any(), any(), any());
        verify(walletChargePersistenceService, never()).completeWalletCharge(any(), any());
    }

    @Test
    @DisplayName("완료된 멱등 요청과 요청 값이 다르면 예외를 던진다")
    void conflict() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);
        AccountRef accountRef = AccountRef.builder().customerId(1001L).accountId(2001L).build();
        Wallet wallet = Wallet.builder().walletId(10L).balance(30000).userAccount(accountRef).build();

        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.of(wallet));
        when(walletChargeIdempotencyService.startOrGet(eq(1L), eq("idempotency-key"), any(), eq(2001L), eq(10000)))
                .thenReturn(WalletChargeIdempotencyResult.completed("WCR-20260525-0001", 2001L, 20000));

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_IDEMPOTENCY_KEY_CONFLICT));
    }

    @Test
    @DisplayName("On-Prem 차감 실패 시 월렛 충전을 확정하지 않는다")
    void debitFailed() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);
        AccountRef accountRef = AccountRef.builder().customerId(1001L).accountId(2001L).build();
        Wallet wallet = Wallet.builder().walletId(10L).balance(30000).userAccount(accountRef).build();

        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.of(wallet));
        when(walletChargeIdempotencyService.startOrGet(eq(1L), eq("idempotency-key"), any(), eq(2001L), eq(10000)))
                .thenAnswer(invocation -> WalletChargeIdempotencyResult.started(invocation.getArgument(2)));
        doThrow(new CustomException(WALLET_DEBIT_FAILED))
                .when(walletAccountDebitService).debit(any(), eq(1001L), eq(2001L), eq(10000));

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_DEBIT_FAILED));

        verify(walletChargeIdempotencyService).fail(1L, "idempotency-key");
        verify(walletChargePersistenceService, never()).completeWalletCharge(any(), any());
    }

    @Test
    @DisplayName("멱등 키 정리 실패가 원래 실패 원인을 덮지 않는다")
    void cleanupFailed() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);
        AccountRef accountRef = AccountRef.builder().customerId(1001L).accountId(2001L).build();
        Wallet wallet = Wallet.builder().walletId(10L).balance(30000).userAccount(accountRef).build();

        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.of(wallet));
        when(walletChargeIdempotencyService.startOrGet(eq(1L), eq("idempotency-key"), any(), eq(2001L), eq(10000)))
                .thenAnswer(invocation -> WalletChargeIdempotencyResult.started(invocation.getArgument(2)));
        doThrow(new CustomException(WALLET_DEBIT_FAILED))
                .when(walletAccountDebitService).debit(any(), eq(1001L), eq(2001L), eq(10000));
        doThrow(new RedisConnectionFailureException("redis down"))
                .when(walletChargeIdempotencyService).fail(1L, "idempotency-key");

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_DEBIT_FAILED));
    }

    @Test
    @DisplayName("월렛 충전 확정 후 멱등 완료 저장이 실패해도 성공 처리한다")
    void completeFailed() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);
        AccountRef accountRef = AccountRef.builder().customerId(1001L).accountId(2001L).build();
        Wallet wallet = Wallet.builder().walletId(10L).balance(30000).userAccount(accountRef).build();

        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.of(wallet));
        when(walletChargeIdempotencyService.startOrGet(eq(1L), eq("idempotency-key"), any(), eq(2001L), eq(10000)))
                .thenAnswer(invocation -> WalletChargeIdempotencyResult.started(invocation.getArgument(2)));
        doThrow(new RedisConnectionFailureException("redis down"))
                .when(walletChargeIdempotencyService).complete(eq(1L), eq("idempotency-key"), any(), eq(2001L), eq(10000));

        assertThatCode(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Idempotency-Key가 없으면 예외를 던진다")
    void missingKey() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);

        assertThatThrownBy(() -> walletService.chargeWallet(1L, " ", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_IDEMPOTENCY_KEY_REQUIRED));
    }

    @Test
    @DisplayName("요청 형식이 올바르지 않으면 예외를 던진다")
    void invalidRequest() {
        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", null))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_CHARGE_INVALID_REQUEST));
    }

    @Test
    @DisplayName("동일 Idempotency-Key가 처리 중이면 예외를 던진다")
    void duplicatedKey() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);
        AccountRef accountRef = AccountRef.builder().customerId(1001L).accountId(2001L).build();
        Wallet wallet = Wallet.builder().walletId(10L).balance(30000).userAccount(accountRef).build();

        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.of(wallet));
        when(walletChargeIdempotencyService.startOrGet(eq(1L), eq("idempotency-key"), any(), eq(2001L), eq(10000)))
                .thenReturn(WalletChargeIdempotencyResult.processing("WCR-20260525-0001"));

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_CHARGE_IN_PROGRESS));
    }

    @Test
    @DisplayName("충전 금액이 올바르지 않으면 예외를 던진다")
    void invalidAmount() {
        ChargeWalletRequest request = new ChargeWalletRequest(0);

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_INVALID_CHARGE_AMOUNT));
    }

    @Test
    @DisplayName("사용자 월렛이 없으면 예외가 발생한다")
    void notFound() {
        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> walletService.findWalletTransactions(1L))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_NOT_FOUND));
    }

    @Test
    @DisplayName("충전할 월렛이 없으면 예외를 던지고 멱등 키를 제거한다")
    void walletNotFound() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);
        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_NOT_FOUND));

        verify(walletChargeIdempotencyService, never()).startOrGet(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("출금 계좌가 없으면 예외를 던진다")
    void accountNotFound() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);
        Wallet wallet = Wallet.builder().walletId(10L).balance(30000).build();

        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.of(wallet));

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_ACCOUNT_NOT_FOUND));
    }

    private WalletTransaction walletTransaction(Long walletTransactionId, Wallet wallet, TransactionFlow transactionFlow, String counterparty, Integer amount, LocalDateTime createdAt) {
        WalletTransaction walletTransaction = WalletTransaction.builder()
                .walletTransactionId(walletTransactionId)
                .wallet(wallet)
                .transactionFlow(transactionFlow)
                .counterparty(counterparty)
                .amount(amount)
                .build();
        ReflectionTestUtils.setField(walletTransaction, "createdAt", createdAt);
        return walletTransaction;
    }
}
