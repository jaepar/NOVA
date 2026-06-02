package woorifisa.project.coreBanking.domain.accountTransaction.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;
import org.mockito.ArgumentCaptor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.SliceImpl;
import woorifisa.project.coreBanking.domain.account.entity.Account;
import woorifisa.project.coreBanking.domain.account.repository.AccountRepository;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.DebitWalletAccountRequest;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.TransferAccountRequest;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.TransactionFlowFilter;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionFlow;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionType;
import woorifisa.project.coreBanking.domain.accountTransaction.repository.AccountTransactionRepository;
import woorifisa.project.coreBanking.domain.customer.entity.Customer;
import woorifisa.project.coreBanking.global.exception.CustomException;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.*;

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
        assertThat(transaction.getBalanceAfter()).isEqualTo(20000);
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
        when(accountTransactionRepository.existsByExternalRequestId(externalRequestId))
                .thenReturn(true);

        var response = accountTransactionService.findRequestResult(externalRequestId);

        assertThat(response.externalRequestId()).isEqualTo(externalRequestId);
    }

    @Test
    @DisplayName("externalRequestId가 존재하지 않으면 예외를 반환한다")
    void notFound() {
        String externalRequestId = "WCR-20260522-0001";

        when(accountTransactionRepository.existsByExternalRequestId(externalRequestId))
                .thenReturn(false);

        assertThatThrownBy(() -> accountTransactionService.findRequestResult(externalRequestId))
                .isInstanceOf(CustomException.class)
                .hasMessage(ACCOUNT_TRANSACTION_NOT_FOUND.getMessage());
    }

    @Test
    @DisplayName("계좌 이체 성공 시 출금/입금 거래내역을 저장하고 양 계좌 잔액을 갱신한다")
    void transferSuccess() {
        TransferAccountRequest request = new TransferAccountRequest(
                "REQ-20260526-0001", 2001L, 2002L, 5000, "박재하", "박재하"
        );
        Account withdraw = Account.builder()
                .accountId(2001L)
                .accountNumber("1122261925001")
                .customer(Customer.builder().name("홍길동").build())
                .balance(30000)
                .build();
        Account deposit = Account.builder()
                .accountId(2002L)
                .accountNumber("1122261925003")
                .customer(Customer.builder().name("박재하").build())
                .balance(7000)
                .build();

        when(accountTransactionRepository.existsByExternalRequestId("REQ-20260526-0001"))
                .thenReturn(false)
                .thenReturn(false);
        when(accountRepository.findByAccountId(2001L)).thenReturn(Optional.of(withdraw));
        when(accountRepository.findById(2002L)).thenReturn(Optional.of(deposit));

        accountTransactionService.transfer(request);

        assertThat(withdraw.getBalance()).isEqualTo(25000);
        assertThat(deposit.getBalance()).isEqualTo(12000);
        verify(accountTransactionRepository, times(2)).save(any(AccountTransaction.class));

        ArgumentCaptor<AccountTransaction> captor = forClass(AccountTransaction.class);
        verify(accountTransactionRepository, times(2)).save(captor.capture());
        assertThat(captor.getAllValues().get(0).getBalanceAfter()).isEqualTo(25000);
        assertThat(captor.getAllValues().get(1).getBalanceAfter()).isEqualTo(12000);
        assertThat(captor.getAllValues().get(0).getCounterParty()).isEqualTo("박재하");
        assertThat(captor.getAllValues().get(1).getCounterParty()).isEqualTo("홍길동");
    }

    @Test
    @DisplayName("계좌 이체 요청 식별자가 중복이면 재처리하지 않는다")
    void transferDuplicate() {
        TransferAccountRequest request = new TransferAccountRequest(
                "REQ-20260526-0001", 2001L, 2002L, 5000, "박재하", "박재하"
        );

        when(accountTransactionRepository.existsByExternalRequestId("REQ-20260526-0001")).thenReturn(true);

        accountTransactionService.transfer(request);

        verify(accountRepository, never()).findByAccountId(any());
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    @DisplayName("계좌 이체 잔액 부족이면 예외를 던진다")
    void transferInsufficientBalance() {
        TransferAccountRequest request = new TransferAccountRequest(
                "REQ-20260526-0001", 2001L, 2002L, 5000, "박재하", "박재하"
        );
        Account withdraw = Account.builder()
                .accountId(2001L)
                .accountNumber("1122261925001")
                .customer(Customer.builder().name("홍길동").build())
                .balance(3000)
                .build();
        Account deposit = Account.builder()
                .accountId(2002L)
                .accountNumber("1122261925003")
                .customer(Customer.builder().name("박재하").build())
                .balance(7000)
                .build();

        when(accountTransactionRepository.existsByExternalRequestId("REQ-20260526-0001"))
                .thenReturn(false)
                .thenReturn(false);
        when(accountRepository.findByAccountId(2001L)).thenReturn(Optional.of(withdraw));
        when(accountRepository.findById(2002L)).thenReturn(Optional.of(deposit));

        assertThatThrownBy(() -> accountTransactionService.transfer(request))
                .isInstanceOf(CustomException.class)
                .hasMessage(ACCOUNT_TRANSFER_INSUFFICIENT_BALANCE.getMessage());
    }

    @Test
    @DisplayName("거래내역 전체 조회 시 최신순 페이지 조건으로 원장 거래내역을 반환한다")
    void findTransactionsAll() {
        Long accountId = 2001L;
        LocalDate from = LocalDate.of(2026, 5, 10);
        LocalDate to = LocalDate.of(2026, 6, 2);
        Account account = Account.builder().accountId(accountId).build();
        AccountTransaction transaction = AccountTransaction.builder()
                .accountTransactionId(9001L)
                .account(account)
                .transactionFlow(TransactionFlow.WITHDRAWAL)
                .transactionType(TransactionType.ACCOUNT_TRANSFER)
                .counterParty("PARK")
                .amount(5000)
                .balanceAfter(25000)
                .memo("월세")
                .externalRequestId("REQ-1")
                .build();
        setCreatedAt(transaction, LocalDateTime.of(2026, 6, 2, 10, 30));

        when(accountRepository.existsById(accountId)).thenReturn(true);
        when(accountTransactionRepository.findByAccount_AccountIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(any(), any(), any(), any()))
                .thenReturn(new SliceImpl<>(List.of(transaction), PageRequest.of(0, 20), false));

        var response = accountTransactionService.findTransactions(
                accountId,
                from,
                to,
                TransactionFlowFilter.ALL,
                0,
                20
        );

        assertThat(response.accountId()).isEqualTo(accountId);
        assertThat(response.transactions()).hasSize(1);
        assertThat(response.transactions().get(0).transactionId()).isEqualTo(9001L);
        assertThat(response.transactions().get(0).counterParty()).isEqualTo("PARK");
        assertThat(response.transactions().get(0).balanceAfter()).isEqualTo(25000);
        assertThat(response.transactions().get(0).transactionDateTime()).isEqualTo(LocalDateTime.of(2026, 6, 2, 10, 30));
        verify(accountTransactionRepository).findByAccount_AccountIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                eq(accountId),
                eq(from.atStartOfDay()),
                eq(to.plusDays(1).atStartOfDay()),
                any()
        );
    }

    @Test
    @DisplayName("거래 흐름 필터가 있으면 해당 흐름만 조회한다")
    void findTransactionsByFlow() {
        Long accountId = 2001L;
        when(accountRepository.existsById(accountId)).thenReturn(true);
        when(accountTransactionRepository.findByAccount_AccountIdAndTransactionFlowAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(any(), any(), any(), any(), any()))
                .thenReturn(new SliceImpl<>(List.of(), PageRequest.of(1, 20), false));

        accountTransactionService.findTransactions(
                accountId,
                LocalDate.of(2026, 5, 10),
                LocalDate.of(2026, 6, 2),
                TransactionFlowFilter.DEPOSIT,
                1,
                20
        );

        verify(accountTransactionRepository).findByAccount_AccountIdAndTransactionFlowAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                eq(accountId),
                eq(TransactionFlow.DEPOSIT),
                any(),
                any(),
                any()
        );
    }

    @Test
    @DisplayName("거래내역 조회 계좌가 없으면 예외를 반환한다")
    void findTransactionsAccountNotFound() {
        Long accountId = 2001L;
        when(accountRepository.existsById(accountId)).thenReturn(false);

        assertThatThrownBy(() -> accountTransactionService.findTransactions(
                accountId,
                LocalDate.of(2026, 5, 10),
                LocalDate.of(2026, 6, 2),
                TransactionFlowFilter.ALL,
                0,
                20
        ))
                .isInstanceOf(CustomException.class)
                .hasMessage(ACCOUNT_TRANSACTION_ACCOUNT_NOT_FOUND.getMessage());

        verify(accountTransactionRepository, never()).findByAccount_AccountIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(any(), any(), any(), any());
    }

    private void setCreatedAt(AccountTransaction transaction, LocalDateTime createdAt) {
        try {
            Field field = woorifisa.project.coreBanking.global.entity.BaseEntity.class.getDeclaredField("createdAt");
            field.setAccessible(true);
            field.set(transaction, createdAt);
        } catch (ReflectiveOperationException exception) {
            throw new IllegalStateException(exception);
        }
    }

}
