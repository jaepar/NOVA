package woorifisa.project.coreBanking.domain.wallet.service;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.dao.DataIntegrityViolationException;
import woorifisa.project.coreBanking.domain.account.entity.Account;
import woorifisa.project.coreBanking.domain.account.repository.AccountRepository;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionFlow;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionType;
import woorifisa.project.coreBanking.domain.accountTransaction.repository.AccountTransactionRepository;
import woorifisa.project.coreBanking.domain.wallet.dto.request.DebitWalletAccountRequest;
import woorifisa.project.coreBanking.domain.wallet.dto.response.DebitWalletAccountResponse;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;

class WalletServiceTest {

    private final AccountRepository accountRepository = mock(AccountRepository.class);
    private final AccountTransactionRepository accountTransactionRepository = mock(AccountTransactionRepository.class);
    private final WalletService walletService = new WalletService(accountRepository, accountTransactionRepository);

    @Test
    void debitWalletChargeDecreasesAccountBalanceAndCreatesWithdrawalTransaction() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 10000L);
        Account account = Account.builder()
                .accountId(2001L)
                .balance(30000)
                .build();

        when(accountTransactionRepository.existsByExternalRequestId("WCR-20260514-0001")).thenReturn(false);
        when(accountRepository.findByAccountIdAndCustomer_CustomerId(2001L, 1001L)).thenReturn(Optional.of(account));

        DebitWalletAccountResponse response = walletService.debitWalletCharge(request);

        assertThat(response.success()).isTrue();
        assertThat(response.code()).isEqualTo(20000);
        assertThat(account.getBalance()).isEqualTo(20000);

        ArgumentCaptor<AccountTransaction> transactionCaptor = forClass(AccountTransaction.class);
        verify(accountTransactionRepository).save(transactionCaptor.capture());
        AccountTransaction transaction = transactionCaptor.getValue();
        assertThat(transaction.getAccount()).isEqualTo(account);
        assertThat(transaction.getTransactionFlow()).isEqualTo(TransactionFlow.WITHDRAWAL);
        assertThat(transaction.getTransactionType()).isEqualTo(TransactionType.WALLET_CHARGE);
        assertThat(transaction.getCounterParty()).isEqualTo("월렛 충전");
        assertThat(transaction.getAmount()).isEqualTo(10000);
        assertThat(transaction.getExternalRequestId()).isEqualTo("WCR-20260514-0001");
    }

    @Test
    void debitWalletChargeReturnsSuccessWithoutDebitWhenExternalRequestIdAlreadyExists() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 10000L);

        when(accountTransactionRepository.existsByExternalRequestId("WCR-20260514-0001")).thenReturn(true);

        DebitWalletAccountResponse response = walletService.debitWalletCharge(request);

        assertThat(response.success()).isTrue();
        assertThat(response.code()).isEqualTo(20000);
        verify(accountRepository, never()).findByAccountIdAndCustomer_CustomerId(any(), any());
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    void debitWalletChargeRechecksExternalRequestIdAfterAccountLockBeforeDebit() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 10000L);
        Account account = Account.builder()
                .accountId(2001L)
                .balance(30000)
                .build();

        when(accountTransactionRepository.existsByExternalRequestId("WCR-20260514-0001"))
                .thenReturn(false)
                .thenReturn(true);
        when(accountRepository.findByAccountIdAndCustomer_CustomerId(2001L, 1001L)).thenReturn(Optional.of(account));

        DebitWalletAccountResponse response = walletService.debitWalletCharge(request);

        assertThat(response.success()).isTrue();
        assertThat(response.code()).isEqualTo(20000);
        assertThat(account.getBalance()).isEqualTo(30000);
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    void debitWalletChargeReturnsSuccessWhenExternalRequestIdUniqueConstraintIsViolated() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 10000L);
        Account account = Account.builder()
                .accountId(2001L)
                .balance(30000)
                .build();

        when(accountTransactionRepository.existsByExternalRequestId("WCR-20260514-0001")).thenReturn(false);
        when(accountRepository.findByAccountIdAndCustomer_CustomerId(2001L, 1001L)).thenReturn(Optional.of(account));
        doThrow(new DataIntegrityViolationException("duplicate external request id"))
                .when(accountTransactionRepository).save(any(AccountTransaction.class));

        DebitWalletAccountResponse response = walletService.debitWalletCharge(request);

        assertThat(response.success()).isTrue();
        assertThat(response.code()).isEqualTo(20000);
    }

    @Test
    void debitWalletChargeFailsWhenAccountDoesNotExist() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 10000L);

        when(accountTransactionRepository.existsByExternalRequestId("WCR-20260514-0001")).thenReturn(false);
        when(accountRepository.findByAccountIdAndCustomer_CustomerId(2001L, 1001L)).thenReturn(Optional.empty());

        DebitWalletAccountResponse response = walletService.debitWalletCharge(request);

        assertThat(response.success()).isFalse();
        assertThat(response.code()).isEqualTo(40400);
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    void debitWalletChargeFailsWhenBalanceIsInsufficientWithoutChangingBalance() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 40000L);
        Account account = Account.builder()
                .accountId(2001L)
                .balance(30000)
                .build();

        when(accountTransactionRepository.existsByExternalRequestId("WCR-20260514-0001")).thenReturn(false);
        when(accountRepository.findByAccountIdAndCustomer_CustomerId(2001L, 1001L)).thenReturn(Optional.of(account));

        DebitWalletAccountResponse response = walletService.debitWalletCharge(request);

        assertThat(response.success()).isFalse();
        assertThat(response.code()).isEqualTo(40000);
        assertThat(account.getBalance()).isEqualTo(30000);
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    void debitWalletChargeFailsWhenRequestAmountIsInvalid() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 0L);

        DebitWalletAccountResponse response = walletService.debitWalletCharge(request);

        assertThat(response.success()).isFalse();
        assertThat(response.code()).isEqualTo(40000);
        verify(accountTransactionRepository, never()).existsByExternalRequestId(any());
        verify(accountRepository, never()).findByAccountIdAndCustomer_CustomerId(any(), any());
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    void debitWalletChargeFailsWhenRequestAmountExceedsIntegerRange() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest(
                "WCR-20260514-0001",
                1001L,
                2001L,
                (long) Integer.MAX_VALUE + 1
        );

        DebitWalletAccountResponse response = walletService.debitWalletCharge(request);

        assertThat(response.success()).isFalse();
        assertThat(response.code()).isEqualTo(40000);
        verify(accountTransactionRepository, never()).existsByExternalRequestId(any());
        verify(accountRepository, never()).findByAccountIdAndCustomer_CustomerId(any(), any());
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    void debitWalletChargeFailsWhenExternalRequestIdIsBlank() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest(" ", 1001L, 2001L, 10000L);

        DebitWalletAccountResponse response = walletService.debitWalletCharge(request);

        assertThat(response.success()).isFalse();
        assertThat(response.code()).isEqualTo(40000);
        verify(accountTransactionRepository, never()).existsByExternalRequestId(any());
        verify(accountRepository, never()).findByAccountIdAndCustomer_CustomerId(any(), any());
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    void debitWalletChargeFailsWhenAccountIdentifiersAreMissing() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", null, 2001L, 10000L);

        DebitWalletAccountResponse response = walletService.debitWalletCharge(request);

        assertThat(response.success()).isFalse();
        assertThat(response.code()).isEqualTo(40000);
        verify(accountTransactionRepository, never()).existsByExternalRequestId(any());
        verify(accountRepository, never()).findByAccountIdAndCustomer_CustomerId(any(), any());
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    void debitWalletChargeFailsWhenWithdrawAccountIdIsMissing() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, null, 10000L);

        DebitWalletAccountResponse response = walletService.debitWalletCharge(request);

        assertThat(response.success()).isFalse();
        assertThat(response.code()).isEqualTo(40000);
        verify(accountTransactionRepository, never()).existsByExternalRequestId(any());
        verify(accountRepository, never()).findByAccountIdAndCustomer_CustomerId(any(), any());
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }
}
