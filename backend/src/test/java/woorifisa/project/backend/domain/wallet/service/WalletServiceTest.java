package woorifisa.project.backend.domain.wallet.service;

import org.junit.jupiter.api.Test;
import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.banking.repository.BankingRepository;
import woorifisa.project.backend.domain.wallet.client.OnPremWalletClient;
import woorifisa.project.backend.domain.wallet.dto.request.ChargeWalletRequest;
import woorifisa.project.backend.domain.wallet.dto.request.DebitWalletAccountRequest;
import woorifisa.project.backend.domain.wallet.dto.response.DebitWalletAccountResponse;
import woorifisa.project.backend.domain.wallet.entity.Wallet;
import woorifisa.project.backend.domain.wallet.entity.WalletTransaction;
import woorifisa.project.backend.domain.wallet.entity.enums.TransactionFlow;
import woorifisa.project.backend.domain.wallet.repository.WalletRepository;
import woorifisa.project.backend.domain.wallet.repository.WalletTransactionRepository;
import woorifisa.project.backend.global.exception.CustomException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentCaptor.forClass;
import org.mockito.ArgumentCaptor;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_ACCOUNT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_DEBIT_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_INVALID_CHARGE_AMOUNT;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_NOT_FOUND;

class WalletServiceTest {

    private final WalletRepository walletRepository = mock(WalletRepository.class);
    private final WalletTransactionRepository walletTransactionRepository = mock(WalletTransactionRepository.class);
    private final BankingRepository bankingRepository = mock(BankingRepository.class);
    private final OnPremWalletClient onPremWalletClient = mock(OnPremWalletClient.class);
    private final WalletService walletService = new WalletService(
            walletRepository,
            walletTransactionRepository,
            bankingRepository,
            onPremWalletClient
    );

    @Test
    void chargeWalletIncreasesBalanceAndCreatesDepositTransactionAfterOnPremDebitSucceeds() {
        Long userId = 1L;
        ChargeWalletRequest request = new ChargeWalletRequest(2001L, 10000L);
        Wallet wallet = Wallet.builder()
                .walletId(10L)
                .balance(30000)
                .build();
        AccountRef accountRef = AccountRef.builder()
                .customerId(1001L)
                .accountId(2001L)
                .build();

        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.of(wallet));
        when(bankingRepository.findByUser_UserIdAndAccountId(userId, 2001L)).thenReturn(Optional.of(accountRef));
        when(onPremWalletClient.debitWalletAccount(any(DebitWalletAccountRequest.class)))
                .thenReturn(new DebitWalletAccountResponse(true, 20000, "계좌 차감이 완료되었습니다."));

        walletService.chargeWallet(userId, "idempotency-key", request);

        assertThat(wallet.getBalance()).isEqualTo(40000);
        ArgumentCaptor<WalletTransaction> transactionCaptor = forClass(WalletTransaction.class);
        verify(walletTransactionRepository).save(transactionCaptor.capture());
        assertThat(transactionCaptor.getValue().getTransactionFlow()).isEqualTo(TransactionFlow.DEPOSIT);
        assertThat(transactionCaptor.getValue().getCounterparty()).isEqualTo("월렛 충전");
        assertThat(transactionCaptor.getValue().getAmount()).isEqualTo(10000);
    }

    @Test
    void chargeWalletDoesNotChangeWalletWhenOnPremDebitFails() {
        Long userId = 1L;
        ChargeWalletRequest request = new ChargeWalletRequest(2001L, 10000L);
        Wallet wallet = Wallet.builder()
                .walletId(10L)
                .balance(30000)
                .build();
        AccountRef accountRef = AccountRef.builder()
                .customerId(1001L)
                .accountId(2001L)
                .build();

        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.of(wallet));
        when(bankingRepository.findByUser_UserIdAndAccountId(userId, 2001L)).thenReturn(Optional.of(accountRef));
        when(onPremWalletClient.debitWalletAccount(any(DebitWalletAccountRequest.class)))
                .thenReturn(new DebitWalletAccountResponse(false, 40000, "계좌 차감에 실패했습니다."));

        assertThatThrownBy(() -> walletService.chargeWallet(userId, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_DEBIT_FAILED));

        assertThat(wallet.getBalance()).isEqualTo(30000);
        verify(walletTransactionRepository, never()).save(any(WalletTransaction.class));
    }

    @Test
    void chargeWalletRejectsInvalidChargeAmount() {
        ChargeWalletRequest request = new ChargeWalletRequest(2001L, 0L);

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_INVALID_CHARGE_AMOUNT));

        verify(onPremWalletClient, never()).debitWalletAccount(any(DebitWalletAccountRequest.class));
        verify(walletTransactionRepository, never()).save(any(WalletTransaction.class));
    }

    @Test
    void chargeWalletFailsWhenWalletDoesNotExist() {
        ChargeWalletRequest request = new ChargeWalletRequest(2001L, 10000L);
        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_NOT_FOUND));

        verify(onPremWalletClient, never()).debitWalletAccount(any(DebitWalletAccountRequest.class));
        verify(walletTransactionRepository, never()).save(any(WalletTransaction.class));
    }

    @Test
    void chargeWalletFailsWhenWithdrawAccountIsNotOwnedByUser() {
        ChargeWalletRequest request = new ChargeWalletRequest(2001L, 10000L);
        Wallet wallet = Wallet.builder()
                .walletId(10L)
                .balance(30000)
                .build();

        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.of(wallet));
        when(bankingRepository.findByUser_UserIdAndAccountId(1L, 2001L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_ACCOUNT_NOT_FOUND));

        assertThat(wallet.getBalance()).isEqualTo(30000);
        verify(onPremWalletClient, never()).debitWalletAccount(any(DebitWalletAccountRequest.class));
        verify(walletTransactionRepository, never()).save(any(WalletTransaction.class));
    }
}
