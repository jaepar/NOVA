package woorifisa.project.backend.domain.wallet.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
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

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
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
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_DEBIT_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_IDEMPOTENCY_KEY_REQUIRED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_NOT_FOUND;

class WalletServiceTest {

    private final WalletRepository walletRepository = mock(WalletRepository.class);
    private final WalletTransactionRepository walletTransactionRepository = mock(WalletTransactionRepository.class);
    private final WalletChargePersistenceService walletChargePersistenceService = mock(WalletChargePersistenceService.class);
    private final CoreBankingWalletClient coreBankingWalletClient = mock(CoreBankingWalletClient.class);
    private final StringRedisTemplate stringRedisTemplate = mock(StringRedisTemplate.class);

    @SuppressWarnings("unchecked")
    private final ValueOperations<String, String> valueOperations = mock(ValueOperations.class);

    private final WalletService walletService = new WalletService(
            walletRepository,
            walletTransactionRepository,
            walletChargePersistenceService,
            coreBankingWalletClient,
            stringRedisTemplate
    );

    @Test
    @DisplayName("사용자의 월렛 잔액과 거래내역을 최신순으로 조회한다")
    void found() {
        Long userId = 1L;
        Wallet wallet = Wallet.builder()
                .walletId(10L)
                .balance(12500)
                .build();
        WalletTransaction first = walletTransaction(101L, wallet, TransactionFlow.DEPOSIT, "월렛 충전", 10000, LocalDateTime.of(2025, 5, 24, 10, 30));
        WalletTransaction second = walletTransaction(102L, wallet, TransactionFlow.WITHDRAWAL, "이마트24 강남점", 2500, LocalDateTime.of(2025, 5, 24, 14, 22));

        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.of(wallet));
        when(walletTransactionRepository.findAllByWallet_WalletIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(second, first));

        WalletTransactionsResponse response = walletService.findWalletTransactions(userId);

        assertThat(response.balance()).isEqualTo(12500);
        assertThat(response.transactions()).hasSize(2);
        assertThat(response.transactions().get(0).walletTransactionId()).isEqualTo(102L);
    }

    @Test
    @DisplayName("신규 충전이면 CoreBanking 차감 후 월렛 충전을 확정하고 완료 키를 저장한다")
    void success() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);

        givenNewCharge();

        walletService.chargeWallet(1L, "idempotency-key", request);

        verify(coreBankingWalletClient).debitWalletAccount(any());
        verify(walletChargePersistenceService).completeWalletCharge(10L, 10000);
        verify(valueOperations).set(
                eq("wallet:charge:result:idempotency-key"),
                eq("DONE"),
                any(Duration.class)
        );
        verify(stringRedisTemplate).delete("wallet:charge:processing:idempotency-key");
    }

    @Test
    @DisplayName("CoreBanking external request id로 Idempotency-Key를 그대로 사용한다")
    void usesIdempotencyKeyAsExternalRequestId() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);

        givenNewCharge();

        walletService.chargeWallet(1L, "idempotency-key", request);

        verify(coreBankingWalletClient).debitWalletAccount(
                org.mockito.ArgumentMatchers.argThat(debitRequest ->
                        "idempotency-key".equals(debitRequest.walletChargeRequestId()))
        );
    }

    @Test
    @DisplayName("이미 완료된 멱등 키면 재처리하지 않고 성공 처리한다")
    void completed() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);

        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("wallet:charge:result:idempotency-key")).thenReturn("DONE");

        walletService.chargeWallet(1L, "idempotency-key", request);

        verify(valueOperations, never()).setIfAbsent(any(), any(), any(Duration.class));
        verify(coreBankingWalletClient, never()).debitWalletAccount(any());
        verify(walletChargePersistenceService, never()).completeWalletCharge(any(), any());
    }

    @Test
    @DisplayName("CoreBanking 차감 실패 시 월렛 충전을 확정하지 않는다")
    void debitFailed() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);

        givenNewCharge();
        doThrow(new CustomException(WALLET_DEBIT_FAILED))
                .when(coreBankingWalletClient).debitWalletAccount(any());

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_DEBIT_FAILED));

        verify(stringRedisTemplate).delete("wallet:charge:processing:idempotency-key");
        verify(walletChargePersistenceService, never()).completeWalletCharge(any(), any());
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
    @DisplayName("동일 Idempotency-Key가 처리 중이면 예외를 던진다")
    void duplicatedKey() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);

        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("wallet:charge:result:idempotency-key")).thenReturn(null);
        when(valueOperations.setIfAbsent(
                eq("wallet:charge:processing:idempotency-key"),
                eq("1"),
                any(Duration.class)
        )).thenReturn(false);

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_CHARGE_IN_PROGRESS));

        verify(coreBankingWalletClient, never()).debitWalletAccount(any());
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
    @DisplayName("월렛이 없으면 예외를 던진다")
    void walletNotFound() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);

        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("wallet:charge:result:idempotency-key")).thenReturn(null);
        when(valueOperations.setIfAbsent(
                eq("wallet:charge:processing:idempotency-key"),
                eq("1"),
                any(Duration.class)
        )).thenReturn(true);
        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_NOT_FOUND));

        verify(stringRedisTemplate).delete("wallet:charge:processing:idempotency-key");
        verify(coreBankingWalletClient, never()).debitWalletAccount(any());
    }

    @Test
    @DisplayName("월렛에 연결된 출금 계좌가 없으면 예외를 던진다")
    void accountNotFound() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);
        Wallet wallet = Wallet.builder().walletId(10L).balance(30000).build();

        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("wallet:charge:result:idempotency-key")).thenReturn(null);
        when(valueOperations.setIfAbsent(
                eq("wallet:charge:processing:idempotency-key"),
                eq("1"),
                any(Duration.class)
        )).thenReturn(true);
        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.of(wallet));

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_ACCOUNT_NOT_FOUND));

        verify(stringRedisTemplate).delete("wallet:charge:processing:idempotency-key");
        verify(coreBankingWalletClient, never()).debitWalletAccount(any());
    }

    private void givenNewCharge() {
        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.of(wallet()));
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("wallet:charge:result:idempotency-key")).thenReturn(null);
        when(valueOperations.setIfAbsent(
                eq("wallet:charge:processing:idempotency-key"),
                eq("1"),
                any(Duration.class)
        )).thenReturn(true);
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

    private Wallet wallet() {
        return Wallet.builder()
                .walletId(10L)
                .balance(30000)
                .userAccount(accountRef())
                .build();
    }

    private AccountRef accountRef() {
        return AccountRef.builder()
                .customerId(1001L)
                .accountId(2001L)
                .build();
    }
}
