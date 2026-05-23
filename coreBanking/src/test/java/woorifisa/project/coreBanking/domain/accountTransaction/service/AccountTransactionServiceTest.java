package woorifisa.project.coreBanking.domain.accountTransaction.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;
import org.mockito.ArgumentCaptor;
import org.springframework.dao.DataIntegrityViolationException;
import woorifisa.project.coreBanking.domain.account.entity.Account;
import woorifisa.project.coreBanking.domain.account.repository.AccountRepository;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.DebitWalletAccountRequest;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionFlow;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionType;
import woorifisa.project.coreBanking.domain.accountTransaction.repository.AccountTransactionRepository;
import woorifisa.project.coreBanking.global.exception.CustomException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.WALLET_ACCOUNT_DEBIT_CONFLICT;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.WALLET_ACCOUNT_DEBIT_INSUFFICIENT_BALANCE;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.WALLET_ACCOUNT_DEBIT_INVALID_REQUEST;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.WALLET_ACCOUNT_DEBIT_NOT_FOUND;

class AccountTransactionServiceTest {

    private final AccountRepository accountRepository = mock(AccountRepository.class);
    private final AccountTransactionRepository accountTransactionRepository = mock(AccountTransactionRepository.class);
    private final AccountTransactionService accountTransactionService = new AccountTransactionService(accountRepository, accountTransactionRepository);

    @Test
    @DisplayName("월렛 충전 계좌차감 성공 시 잔액을 감소시키고 출금 거래내역을 저장한다")
    void success() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 10000);
        Account account = Account.builder()
                .accountId(2001L)
                .balance(30000)
                .build();

        when(accountTransactionRepository.existsByExternalRequestId("WCR-20260514-0001")).thenReturn(false);
        when(accountRepository.findByAccountIdAndCustomer_CustomerId(2001L, 1001L)).thenReturn(Optional.of(account));

        accountTransactionService.debitWalletCharge(request);

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
    void duplicate() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 10000);

        when(accountTransactionRepository.existsByExternalRequestId("WCR-20260514-0001")).thenReturn(true);

        accountTransactionService.debitWalletCharge(request);

        verify(accountRepository, never()).findByAccountIdAndCustomer_CustomerId(any(), any());
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    @DisplayName("계좌 락 획득 후 중복 요청이면 차감하지 않고 성공 응답한다")
    void duplicateAfterLock() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 10000);
        Account account = Account.builder()
                .accountId(2001L)
                .balance(30000)
                .build();

        when(accountTransactionRepository.existsByExternalRequestId("WCR-20260514-0001"))
                .thenReturn(false)
                .thenReturn(true);
        when(accountRepository.findByAccountIdAndCustomer_CustomerId(2001L, 1001L)).thenReturn(Optional.of(account));

        accountTransactionService.debitWalletCharge(request);

        assertThat(account.getBalance()).isEqualTo(30000);
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    @DisplayName("외부 요청 식별자 유니크 제약 충돌 후 처리 결과가 있으면 멱등 성공으로 응답한다")
    void duplicateOnSave() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 10000);
        Account account = Account.builder()
                .accountId(2001L)
                .balance(30000)
                .build();

        when(accountTransactionRepository.existsByExternalRequestId("WCR-20260514-0001"))
                .thenReturn(false)
                .thenReturn(false)
                .thenReturn(true);
        when(accountRepository.findByAccountIdAndCustomer_CustomerId(2001L, 1001L)).thenReturn(Optional.of(account));
        doThrow(new DataIntegrityViolationException("duplicate external request id"))
                .when(accountTransactionRepository)
                .save(any(AccountTransaction.class));

        accountTransactionService.debitWalletCharge(request);

        assertThat(account.getBalance()).isEqualTo(30000);
        verify(accountTransactionRepository).save(any(AccountTransaction.class));
    }

    @Test
    @DisplayName("외부 요청 식별자 유니크 제약 충돌 후 처리 결과가 없으면 공통 예외를 던진다")
    void conflictOnSave() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 10000);
        Account account = Account.builder()
                .accountId(2001L)
                .balance(30000)
                .build();

        when(accountTransactionRepository.existsByExternalRequestId("WCR-20260514-0001")).thenReturn(false);
        when(accountRepository.findByAccountIdAndCustomer_CustomerId(2001L, 1001L)).thenReturn(Optional.of(account));
        doThrow(new DataIntegrityViolationException("duplicate external request id"))
                .when(accountTransactionRepository)
                .save(any(AccountTransaction.class));

        assertThatThrownBy(() -> accountTransactionService.debitWalletCharge(request))
                .isInstanceOf(CustomException.class)
                .hasMessage(WALLET_ACCOUNT_DEBIT_CONFLICT.getMessage());

        assertThat(account.getBalance()).isEqualTo(30000);
    }

    @Test
    @DisplayName("출금 계좌가 없으면 공통 예외를 던지고 거래내역을 저장하지 않는다")
    void missingAccountFails() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 10000);

        when(accountTransactionRepository.existsByExternalRequestId("WCR-20260514-0001")).thenReturn(false);
        when(accountRepository.findByAccountIdAndCustomer_CustomerId(2001L, 1001L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountTransactionService.debitWalletCharge(request))
                .isInstanceOf(CustomException.class)
                .hasMessage(WALLET_ACCOUNT_DEBIT_NOT_FOUND.getMessage());

        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    @DisplayName("잔액 부족이면 공통 예외를 던지고 잔액을 변경하지 않는다")
    void insufficientBalanceFails() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 40000);
        Account account = Account.builder()
                .accountId(2001L)
                .balance(30000)
                .build();

        when(accountTransactionRepository.existsByExternalRequestId("WCR-20260514-0001")).thenReturn(false);
        when(accountRepository.findByAccountIdAndCustomer_CustomerId(2001L, 1001L)).thenReturn(Optional.of(account));

        assertThatThrownBy(() -> accountTransactionService.debitWalletCharge(request))
                .isInstanceOf(CustomException.class)
                .hasMessage(WALLET_ACCOUNT_DEBIT_INSUFFICIENT_BALANCE.getMessage());

        assertThat(account.getBalance()).isEqualTo(30000);
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    @DisplayName("차감 금액이 0 이하이면 공통 예외를 던진다")
    void nonPositiveAmountFails() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 0);

        assertThatThrownBy(() -> accountTransactionService.debitWalletCharge(request))
                .isInstanceOf(CustomException.class)
                .hasMessage(WALLET_ACCOUNT_DEBIT_INVALID_REQUEST.getMessage());

        verify(accountTransactionRepository, never()).existsByExternalRequestId(any());
        verify(accountRepository, never()).findByAccountIdAndCustomer_CustomerId(any(), any());
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    @DisplayName("요청 식별자가 공백이면 공통 예외를 던진다")
    void blankRequestIdFails() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest(" ", 1001L, 2001L, 10000);

        assertThatThrownBy(() -> accountTransactionService.debitWalletCharge(request))
                .isInstanceOf(CustomException.class)
                .hasMessage(WALLET_ACCOUNT_DEBIT_INVALID_REQUEST.getMessage());

        verify(accountTransactionRepository, never()).existsByExternalRequestId(any());
        verify(accountRepository, never()).findByAccountIdAndCustomer_CustomerId(any(), any());
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    @DisplayName("고객 ID가 없으면 공통 예외를 던진다")
    void missingCustomerIdFails() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", null, 2001L, 10000);

        assertThatThrownBy(() -> accountTransactionService.debitWalletCharge(request))
                .isInstanceOf(CustomException.class)
                .hasMessage(WALLET_ACCOUNT_DEBIT_INVALID_REQUEST.getMessage());

        verify(accountTransactionRepository, never()).existsByExternalRequestId(any());
        verify(accountRepository, never()).findByAccountIdAndCustomer_CustomerId(any(), any());
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    @DisplayName("출금 계좌 ID가 없으면 공통 예외를 던진다")
    void missingWithdrawAccountIdFails() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, null, 10000);

        assertThatThrownBy(() -> accountTransactionService.debitWalletCharge(request))
                .isInstanceOf(CustomException.class)
                .hasMessage(WALLET_ACCOUNT_DEBIT_INVALID_REQUEST.getMessage());

        verify(accountTransactionRepository, never()).existsByExternalRequestId(any());
        verify(accountRepository, never()).findByAccountIdAndCustomer_CustomerId(any(), any());
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }
  
    @Test
    @DisplayName("externalRequestId가 존재하면 거래 처리 결과를 확인한다")
    void found() {
        String externalRequestId = "TR-20260513-0001";
        AccountTransaction accountTransaction = AccountTransaction.builder()
                .externalRequestId(externalRequestId)
                .build();

        when(accountTransactionRepository.findByExternalRequestId(externalRequestId))
                .thenReturn(Optional.of(accountTransaction));

        var response = accountTransactionService.findRequestResult(externalRequestId);

        assertThat(response.externalRequestId()).isEqualTo(externalRequestId);
    }

    @Test
    @DisplayName("externalRequestId가 존재하지 않으면 예외를 반환한다")
    void notFound() {
        String externalRequestId = "WCR-20260522-0001";

        when(accountTransactionRepository.findByExternalRequestId(externalRequestId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountTransactionService.findRequestResult(externalRequestId))
                .isInstanceOf(CustomException.class)
                .hasMessage(ACCOUNT_TRANSACTION_NOT_FOUND.getMessage());
    }
}
