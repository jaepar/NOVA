package woorifisa.project.coreBanking.domain.accountTransaction.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.SliceImpl;
import org.springframework.data.domain.Sort;
import woorifisa.project.coreBanking.domain.account.entity.Account;
import woorifisa.project.coreBanking.domain.account.repository.AccountRepository;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.DebitWalletAccountRequest;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.TransactionFlowFilter;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.TransferAccountRequest;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.UpdateTransactionMemoRequest;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;
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
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.ACCOUNT_TRANSACTION_ACCOUNT_NOT_FOUND;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.ACCOUNT_TRANSACTION_NOT_FOUND;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.ACCOUNT_TRANSFER_INSUFFICIENT_BALANCE;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.WALLET_ACCOUNT_DEBIT_CONFLICT;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.WALLET_ACCOUNT_DEBIT_INSUFFICIENT_BALANCE;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.WALLET_ACCOUNT_DEBIT_INVALID_REQUEST;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.WALLET_ACCOUNT_DEBIT_NOT_FOUND;

class AccountTransactionServiceTest {

    private final AccountRepository accountRepository = mock(AccountRepository.class);
    private final AccountTransactionRepository accountTransactionRepository = mock(AccountTransactionRepository.class);
    private final AccountTransactionService accountTransactionService = new AccountTransactionService(accountRepository, accountTransactionRepository);

    @Test
    @DisplayName("월렛 충전 차감 성공 시 잔액을 차감하고 거래내역을 저장한다")
    void success() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 10000);
        Account account = Account.builder().accountId(2001L).balance(30000).build();

        when(accountTransactionRepository.existsByExternalRequestId("WCR-20260514-0001")).thenReturn(false);
        when(accountRepository.findByAccountIdAndCustomer_CustomerId(2001L, 1001L)).thenReturn(Optional.of(account));

        accountTransactionService.debitWalletCharge(request);

        assertThat(account.getBalance()).isEqualTo(20000);
    }

    @Test
    @DisplayName("저장 시 충돌이 발생하고 이미 처리된 요청이면 성공으로 본다")
    void conflictOnSave() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest("WCR-20260514-0001", 1001L, 2001L, 10000);
        Account account = Account.builder().accountId(2001L).balance(30000).build();

        when(accountTransactionRepository.existsByExternalRequestId("WCR-20260514-0001")).thenReturn(false);
        when(accountRepository.findByAccountIdAndCustomer_CustomerId(2001L, 1001L)).thenReturn(Optional.of(account));
        doThrow(new DataIntegrityViolationException("duplicate external request id"))
                .when(accountTransactionRepository).save(any(AccountTransaction.class));

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
                "REQ-20260526-0001", "1122261925001", "1122261925003", 5000
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
        when(accountRepository.findByAccountNumber("1122261925001")).thenReturn(Optional.of(withdraw));
        when(accountRepository.findByAccountNumber("1122261925003")).thenReturn(Optional.of(deposit));

        accountTransactionService.transfer(request);

        assertThat(withdraw.getBalance()).isEqualTo(25000);
        assertThat(deposit.getBalance()).isEqualTo(12000);
        verify(accountTransactionRepository, times(2)).save(any(AccountTransaction.class));

        ArgumentCaptor<AccountTransaction> captor = forClass(AccountTransaction.class);
        verify(accountTransactionRepository, times(2)).save(captor.capture());
        assertThat(captor.getAllValues().get(0).getCounterParty()).isEqualTo("박재하");
        assertThat(captor.getAllValues().get(1).getCounterParty()).isEqualTo("홍길동");
        assertThat(captor.getAllValues().get(0).getBalanceAfter()).isEqualTo(25000);
        assertThat(captor.getAllValues().get(1).getBalanceAfter()).isEqualTo(12000);
        assertThat(captor.getAllValues().get(0).getMemo()).isNull();
        assertThat(captor.getAllValues().get(1).getMemo()).isNull();
    }

    @Test
    @DisplayName("계좌 이체 요청 식별자가 중복이면 재처리하지 않는다")
    void transferDuplicate() {
        TransferAccountRequest request = new TransferAccountRequest(
                "REQ-20260526-0001", "1122261925001", "1122261925003", 5000
        );

        when(accountTransactionRepository.existsByExternalRequestId("REQ-20260526-0001")).thenReturn(true);

        accountTransactionService.transfer(request);

        verify(accountRepository, never()).findByAccountNumber(any());
        verify(accountTransactionRepository, never()).save(any(AccountTransaction.class));
    }

    @Test
    @DisplayName("계좌 이체 잔액 부족이면 예외를 던진다")
    void transferInsufficientBalance() {
        TransferAccountRequest request = new TransferAccountRequest(
                "REQ-20260526-0001", "1122261925001", "1122261925003", 5000
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
        when(accountRepository.findByAccountNumber("1122261925001")).thenReturn(Optional.of(withdraw));
        when(accountRepository.findByAccountNumber("1122261925003")).thenReturn(Optional.of(deposit));

        assertThatThrownBy(() -> accountTransactionService.transfer(request))
                .isInstanceOf(CustomException.class)
                .hasMessage(ACCOUNT_TRANSFER_INSUFFICIENT_BALANCE.getMessage());
    }

    @Test
    @DisplayName("거래내역 전체 조회 시 Slice 응답을 반환한다")
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
        when(accountTransactionRepository.findTransactions(any(), any(), any(), any(), any(), any()))
                .thenReturn(new SliceImpl<>(List.of(transaction), PageRequest.of(0, 20), false));

        var response = accountTransactionService.findTransactions(
                accountId,
                from,
                to,
                TransactionFlowFilter.ALL,
                "park",
                Sort.Direction.ASC,
                0,
                20
        );

        assertThat(response.transactions()).hasSize(1);
        verify(accountTransactionRepository).findTransactions(
                eq(accountId),
                eq(null),
                eq("park"),
                eq(from.atStartOfDay()),
                eq(to.plusDays(1).atStartOfDay()),
                any()
        );
    }

    @Test
    @DisplayName("거래 유형 필터가 있으면 해당 유형으로 조회한다")
    void findTransactionsByFlow() {
        Long accountId = 2001L;
        when(accountRepository.existsById(accountId)).thenReturn(true);
        when(accountTransactionRepository.findTransactions(any(), any(), any(), any(), any(), any()))
                .thenReturn(new SliceImpl<>(List.of(), PageRequest.of(1, 20), false));

        accountTransactionService.findTransactions(
                accountId,
                LocalDate.of(2026, 5, 10),
                LocalDate.of(2026, 6, 2),
                TransactionFlowFilter.DEPOSIT,
                null,
                Sort.Direction.DESC,
                1,
                20
        );

        verify(accountTransactionRepository).findTransactions(
                eq(accountId),
                eq(TransactionFlow.DEPOSIT),
                eq(null),
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
                "park",
                Sort.Direction.ASC,
                0,
                20
        ))
                .isInstanceOf(CustomException.class)
                .hasMessage(ACCOUNT_TRANSACTION_ACCOUNT_NOT_FOUND.getMessage());
    }

    @Test
    @DisplayName("거래내역 메모를 수정한다")
    void updateMemoSuccess() {
        Long transactionId = 9001L;
        AccountTransaction transaction = AccountTransaction.builder()
                .accountTransactionId(transactionId)
                .transactionFlow(TransactionFlow.WITHDRAWAL)
                .transactionType(TransactionType.ACCOUNT_TRANSFER)
                .amount(5000)
                .memo("기존")
                .build();

        when(accountTransactionRepository.findById(transactionId)).thenReturn(Optional.of(transaction));

        accountTransactionService.updateMemo(transactionId, new UpdateTransactionMemoRequest("월세"));

        assertThat(transaction.getMemo()).isEqualTo("월세");
    }

    @Test
    @DisplayName("빈 메모는 null로 정규화해 저장한다")
    void updateMemoBlankToNull() {
        Long transactionId = 9001L;
        AccountTransaction transaction = AccountTransaction.builder()
                .accountTransactionId(transactionId)
                .transactionFlow(TransactionFlow.WITHDRAWAL)
                .transactionType(TransactionType.ACCOUNT_TRANSFER)
                .amount(5000)
                .memo("기존")
                .build();
        when(accountTransactionRepository.findById(transactionId)).thenReturn(Optional.of(transaction));

        accountTransactionService.updateMemo(transactionId, new UpdateTransactionMemoRequest("   "));

        assertThat(transaction.getMemo()).isNull();
    }

    @Test
    @DisplayName("거래내역이 없으면 메모 수정 예외를 반환한다")
    void updateMemoNotFound() {
        Long transactionId = 9001L;
        when(accountTransactionRepository.findById(transactionId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountTransactionService.updateMemo(
                transactionId,
                new UpdateTransactionMemoRequest("월세")
        ))
                .isInstanceOf(CustomException.class)
                .hasMessage(ACCOUNT_TRANSACTION_NOT_FOUND.getMessage());
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
