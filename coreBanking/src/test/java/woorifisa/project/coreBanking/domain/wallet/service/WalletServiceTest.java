package woorifisa.project.coreBanking.domain.wallet.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.ArgumentCaptor;
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

class WalletServiceTest {

    private final AccountRepository accountRepository = mock(AccountRepository.class);
    private final AccountTransactionRepository accountTransactionRepository = mock(AccountTransactionRepository.class);
    private final WalletService walletService = new WalletService(accountRepository, accountTransactionRepository);

    @Test
    @DisplayName("월렛 충전 계좌차감 성공 시 잔액을 감소시키고 출금 거래내역을 저장한다")
    void debitWalletChargeSucceeds() {
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
    @DisplayName("이미 처리된 요청이면 재차감하지 않고 성공 응답한다")
    void duplicateRequestReturnsSuccess() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 10000L);

        when(accountTransactionRepository.existsByExternalRequestId("WCR-20260514-0001")).thenReturn(true);

        DebitWalletAccountResponse response = walletService.debitWalletCharge(request);

        assertThat(response.success()).isTrue();
        assertThat(response.code()).isEqualTo(20000);
        verify(accountRepository, never()).findByAccountIdAndCustomer_CustomerId(any(), any());
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    @DisplayName("계좌 락 획득 후 중복 요청이면 차감하지 않고 성공 응답한다")
    void duplicateRequestAfterAccountLockReturnsSuccess() {
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
    @DisplayName("출금 계좌가 없으면 실패 응답하고 거래내역을 저장하지 않는다")
    void missingAccountFails() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 10000L);

        when(accountTransactionRepository.existsByExternalRequestId("WCR-20260514-0001")).thenReturn(false);
        when(accountRepository.findByAccountIdAndCustomer_CustomerId(2001L, 1001L)).thenReturn(Optional.empty());

        DebitWalletAccountResponse response = walletService.debitWalletCharge(request);

        assertThat(response.success()).isFalse();
        assertThat(response.code()).isEqualTo(40400);
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    @DisplayName("잔액 부족이면 실패 응답하고 잔액을 변경하지 않는다")
    void insufficientBalanceFails() {
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
    @DisplayName("차감 금액이 0원 이하면 실패 응답한다")
    void nonPositiveAmountFails() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 0L);

        DebitWalletAccountResponse response = walletService.debitWalletCharge(request);

        assertThat(response.success()).isFalse();
        assertThat(response.code()).isEqualTo(40000);
        verify(accountTransactionRepository, never()).existsByExternalRequestId(any());
        verify(accountRepository, never()).findByAccountIdAndCustomer_CustomerId(any(), any());
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    @DisplayName("차감 금액이 정수 범위를 초과하면 실패 응답한다")
    void amountOverflowFails() {
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
    @DisplayName("요청 식별자가 공백이면 실패 응답한다")
    void blankRequestIdFails() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest(" ", 1001L, 2001L, 10000L);

        DebitWalletAccountResponse response = walletService.debitWalletCharge(request);

        assertThat(response.success()).isFalse();
        assertThat(response.code()).isEqualTo(40000);
        verify(accountTransactionRepository, never()).existsByExternalRequestId(any());
        verify(accountRepository, never()).findByAccountIdAndCustomer_CustomerId(any(), any());
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    @DisplayName("고객 ID가 없으면 실패 응답한다")
    void missingCustomerIdFails() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", null, 2001L, 10000L);

        DebitWalletAccountResponse response = walletService.debitWalletCharge(request);

        assertThat(response.success()).isFalse();
        assertThat(response.code()).isEqualTo(40000);
        verify(accountTransactionRepository, never()).existsByExternalRequestId(any());
        verify(accountRepository, never()).findByAccountIdAndCustomer_CustomerId(any(), any());
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    @DisplayName("출금 계좌 ID가 없으면 실패 응답한다")
    void missingWithdrawAccountIdFails() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, null, 10000L);

        DebitWalletAccountResponse response = walletService.debitWalletCharge(request);

        assertThat(response.success()).isFalse();
        assertThat(response.code()).isEqualTo(40000);
        verify(accountTransactionRepository, never()).existsByExternalRequestId(any());
        verify(accountRepository, never()).findByAccountIdAndCustomer_CustomerId(any(), any());
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }
}
