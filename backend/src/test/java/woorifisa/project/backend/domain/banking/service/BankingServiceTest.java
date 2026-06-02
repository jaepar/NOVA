package woorifisa.project.backend.domain.banking.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingTransactionQuery;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingTransferRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingRecipientLookupResponse;
import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingTransactionsResponse;
import woorifisa.project.backend.domain.banking.dto.request.AccountPasswordVerifyRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransactionFlowFilter;
import woorifisa.project.backend.domain.banking.dto.request.TransactionPeriod;
import woorifisa.project.backend.domain.banking.dto.request.TransferPreviewRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransferRequest;
import woorifisa.project.backend.domain.banking.dto.response.BankingTransactionsResponse;
import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.banking.repository.AccountRefRepository;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.global.corebanking.client.CoreBankingClient;
import woorifisa.project.backend.global.exception.CustomException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BAD_REQUEST;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_ACCOUNT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_CORE_BANKING_COMMUNICATION_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_TRANSFER_PROCESSING;

@ExtendWith(MockitoExtension.class)
class BankingServiceTest {

    @Mock
    private AccountRefRepository accountRefRepository;
    @Mock
    private StringRedisTemplate stringRedisTemplate;
    @Mock
    private ValueOperations<String, String> valueOperations;
    @Mock
    private CoreBankingClient coreBankingClient;

    private BankingService bankingService;

    @BeforeEach
    void setUp() {
        bankingService = new BankingService(
                accountRefRepository,
                stringRedisTemplate,
                coreBankingClient
        );
        lenient().when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    @DisplayName("멱등키 처리중 키를 획득하면 코어뱅킹 이체를 호출하고 결과를 캐시한다")
    void transferSuccess() {
        Long userId = 1L;
        String idempotencyKey = "key-1";
        TransferRequest request = new TransferRequest(2001L, 2002L, 5000, "박재하", "박재하");
        AccountRef accountRef = AccountRef.builder()
                .accountRefId(1L)
                .user(User.builder().userId(userId).build())
                .customerId(1001L)
                .accountId(2001L)
                .accountNumber("1122261925001")
                .balance(10000)
                .hasAccount(true)
                .build();
        when(valueOperations.get("banking:transfer:result:key-1")).thenReturn(null);
        when(valueOperations.setIfAbsent(anyString(), anyString(), any())).thenReturn(true);
        when(accountRefRepository.findByUser_UserIdAndAccountId(userId, 2001L)).thenReturn(Optional.of(accountRef));
        doNothing().when(coreBankingClient).transfer(any());

        bankingService.transfer(userId, idempotencyKey, request);

        ArgumentCaptor<CoreBankingTransferRequest> captor = ArgumentCaptor.forClass(CoreBankingTransferRequest.class);
        verify(coreBankingClient).transfer(captor.capture());
        CoreBankingTransferRequest coreRequest = captor.getValue();
        assertThat(coreRequest.withdrawAccountId()).isEqualTo(2001L);
        assertThat(coreRequest.depositAccountId()).isEqualTo(2002L);
        assertThat(coreRequest.externalRequestId()).isEqualTo(idempotencyKey);
        assertThat(accountRef.getBalance()).isEqualTo(5000);
        verify(stringRedisTemplate).delete("banking:transfer:processing:key-1");
    }

    @Test
    @DisplayName("동일 멱등키가 이미 처리중이면 예외를 반환한다")
    void transferProcessing() {
        when(valueOperations.get("banking:transfer:result:key-1")).thenReturn(null);
        when(valueOperations.setIfAbsent(anyString(), anyString(), any())).thenReturn(false);

        assertThatThrownBy(() -> bankingService.transfer(1L, "key-1",
                new TransferRequest(2001L, 2002L, 5000, "박재하", "박재하")))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(BANKING_TRANSFER_PROCESSING);

        verify(coreBankingClient, never()).transfer(any());
    }

    @Test
    @DisplayName("같은 출금 계좌가 이미 처리중이면 예외를 반환한다")
    void transferProcessingByAccountLock() {
        Long userId = 1L;
        TransferRequest request = new TransferRequest(2001L, 2002L, 5000, "박재하", "박재하");
        AccountRef accountRef = AccountRef.builder()
                .accountRefId(1L)
                .user(User.builder().userId(userId).build())
                .customerId(1001L)
                .accountId(2001L)
                .accountNumber("1122261925001")
                .balance(10000)
                .hasAccount(true)
                .build();

        when(valueOperations.get("banking:transfer:result:key-acc-lock")).thenReturn(null);
        when(valueOperations.setIfAbsent("banking:transfer:processing:key-acc-lock", "1", java.time.Duration.ofMinutes(5)))
                .thenReturn(true);
        when(valueOperations.setIfAbsent("account:debit:processing:2001", "1", java.time.Duration.ofMinutes(5)))
                .thenReturn(false);
        when(accountRefRepository.findByUser_UserIdAndAccountId(userId, 2001L)).thenReturn(Optional.of(accountRef));

        assertThatThrownBy(() -> bankingService.transfer(userId, "key-acc-lock", request))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(BANKING_TRANSFER_PROCESSING);

        verify(coreBankingClient, never()).transfer(any());
        verify(stringRedisTemplate).delete("banking:transfer:processing:key-acc-lock");
    }

    @Test
    @DisplayName("멱등키 완료 결과가 캐시에 있으면 코어뱅킹 재호출 없이 응답한다")
    void transferFromCache() {
        when(valueOperations.get("banking:transfer:result:key-1")).thenReturn("DONE");

        bankingService.transfer(
                1L,
                "key-1",
                new TransferRequest(2001L, 2002L, 5000, "박재하", "박재하")
        );

        verify(coreBankingClient, never()).transfer(any());
    }

    @Test
    @DisplayName("코어뱅킹 이체 호출이 실패해도 요청 결과 조회에서 존재하면 성공 처리한다")
    void transferSuccessWhenLookupExistsAfterFailure() {
        Long userId = 1L;
        String idempotencyKey = "key-lookup-exists";
        TransferRequest request = new TransferRequest(2001L, 2002L, 5000, "박재하", "박재하");
        AccountRef accountRef = AccountRef.builder()
                .accountRefId(1L)
                .user(User.builder().userId(userId).build())
                .customerId(1001L)
                .accountId(2001L)
                .accountNumber("1122261925001")
                .balance(10000)
                .hasAccount(true)
                .build();

        when(valueOperations.get("banking:transfer:result:key-lookup-exists")).thenReturn(null);
        when(valueOperations.setIfAbsent(anyString(), anyString(), any())).thenReturn(true);
        when(accountRefRepository.findByUser_UserIdAndAccountId(userId, 2001L)).thenReturn(Optional.of(accountRef));
        doThrow(new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED)).when(coreBankingClient).transfer(any());
        when(coreBankingClient.existsTransferRequest(idempotencyKey))
                .thenReturn(false)
                .thenReturn(true);

        bankingService.transfer(userId, idempotencyKey, request);

        verify(coreBankingClient, times(1)).transfer(any());
        verify(coreBankingClient, times(2)).existsTransferRequest(idempotencyKey);
        assertThat(accountRef.getBalance()).isEqualTo(5000);
    }

    @Test
    @DisplayName("코어뱅킹 이체 1차 실패 후 조회 미존재면 1회 재요청한다")
    void transferRetryWhenLookupNotExists() {
        Long userId = 1L;
        String idempotencyKey = "key-retry";
        TransferRequest request = new TransferRequest(2001L, 2002L, 5000, "박재하", "박재하");
        AccountRef accountRef = AccountRef.builder()
                .accountRefId(1L)
                .user(User.builder().userId(userId).build())
                .customerId(1001L)
                .accountId(2001L)
                .accountNumber("1122261925001")
                .balance(10000)
                .hasAccount(true)
                .build();

        when(valueOperations.get("banking:transfer:result:key-retry")).thenReturn(null);
        when(valueOperations.setIfAbsent(anyString(), anyString(), any())).thenReturn(true);
        when(accountRefRepository.findByUser_UserIdAndAccountId(userId, 2001L)).thenReturn(Optional.of(accountRef));
        doThrow(new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED))
                .doNothing()
                .when(coreBankingClient).transfer(any());
        when(coreBankingClient.existsTransferRequest(idempotencyKey)).thenReturn(false);

        bankingService.transfer(userId, idempotencyKey, request);

        verify(coreBankingClient, times(2)).transfer(any());
        verify(coreBankingClient, times(2)).existsTransferRequest(idempotencyKey);
        assertThat(accountRef.getBalance()).isEqualTo(5000);
    }

    @Test
    @DisplayName("이체 사전 조회 시 내 계좌 정보와 수취인명을 함께 반환한다")
    void previewTransferSuccess() {
        Long userId = 1L;
        AccountRef accountRef = AccountRef.builder()
                .accountRefId(1L)
                .user(User.builder().userId(userId).build())
                .accountId(2001L)
                .accountName("우리SUPER주거래통장")
                .accountNumber("1002867390781")
                .hasAccount(true)
                .build();
        when(accountRefRepository.findFirstByUser_UserIdAndHasAccountTrueOrderByAccountRefIdAsc(userId))
                .thenReturn(Optional.of(accountRef));
        when(coreBankingClient.lookupRecipient(any()))
                .thenReturn(new CoreBankingRecipientLookupResponse("백민정"));

        var response = bankingService.previewTransfer(userId, new TransferPreviewRequest("BUSAN", "1122261925003"));

        assertThat(response.myAccount().accountName()).isEqualTo("우리SUPER주거래통장");
        assertThat(response.myAccount().accountNumber()).isEqualTo("1002867390781");
        assertThat(response.recipient().recipientName()).isEqualTo("백민정");
    }

    @Test
    @DisplayName("본인 계좌 비밀번호 검증 요청을 코어뱅킹으로 전달한다")
    void verifyAccountPasswordSuccess() {
        Long userId = 1L;
        AccountRef accountRef = AccountRef.builder()
                .accountRefId(1L)
                .user(User.builder().userId(userId).build())
                .accountId(2001L)
                .hasAccount(true)
                .build();

        when(accountRefRepository.findByUser_UserIdAndAccountId(userId, 2001L)).thenReturn(Optional.of(accountRef));
        doNothing().when(coreBankingClient).verifyAccountPassword(any());

        bankingService.verifyAccountPassword(userId, new AccountPasswordVerifyRequest(2001L, "1234"));

        verify(coreBankingClient).verifyAccountPassword(any());
    }

    @Test
    @DisplayName("본인 계좌 거래내역 조회 요청을 기간/유형/페이지 조건과 함께 코어뱅킹으로 전달한다")
    void findTransactionsSuccess() {
        Long userId = 1L;
        Long accountId = 2001L;
        Pageable pageable = PageRequest.of(0, 20);
        AccountRef accountRef = AccountRef.builder()
                .accountRefId(1L)
                .user(User.builder().userId(userId).build())
                .accountId(accountId)
                .hasAccount(true)
                .build();
        CoreBankingTransactionsResponse coreResponse = new CoreBankingTransactionsResponse(
                accountId,
                List.of(new CoreBankingTransactionsResponse.Transaction(
                        9001L,
                        "DEPOSIT",
                        "WALLET_CHARGE",
                        "월렛 충전",
                        10000,
                        50000,
                        "충전",
                        LocalDateTime.of(2026, 6, 2, 10, 30)
                )),
                0,
                20,
                false
        );

        when(accountRefRepository.findByUser_UserIdAndAccountId(userId, accountId))
                .thenReturn(Optional.of(accountRef));
        when(coreBankingClient.findAccountTransactions(any())).thenReturn(coreResponse);

        BankingTransactionsResponse response = bankingService.findTransactions(
                userId,
                accountId,
                TransactionPeriod.ONE_MONTH,
                TransactionFlowFilter.ALL,
                null,
                null,
                pageable
        );

        ArgumentCaptor<CoreBankingTransactionQuery> captor = ArgumentCaptor.forClass(CoreBankingTransactionQuery.class);
        verify(coreBankingClient).findAccountTransactions(captor.capture());
        CoreBankingTransactionQuery query = captor.getValue();
        assertThat(query.accountId()).isEqualTo(accountId);
        assertThat(query.from()).isEqualTo(LocalDate.now().minusMonths(1));
        assertThat(query.to()).isEqualTo(LocalDate.now());
        assertThat(query.flow()).isEqualTo(TransactionFlowFilter.ALL);
        assertThat(query.page()).isEqualTo(0);
        assertThat(query.size()).isEqualTo(20);
        assertThat(response.accountId()).isEqualTo(accountId);
        assertThat(response.period()).isEqualTo(TransactionPeriod.ONE_MONTH);
        assertThat(response.flow()).isEqualTo(TransactionFlowFilter.ALL);
        assertThat(response.transactions()).hasSize(1);
        assertThat(response.transactions().get(0).counterParty()).isEqualTo("월렛 충전");
        assertThat(response.transactions().get(0).balanceAfter()).isEqualTo(50000);
        assertThat(response.transactions().get(0).memo()).isEqualTo("충전");
        assertThat(response.hasNext()).isFalse();
    }

    @Test
    @DisplayName("직접 입력 기간이면 요청한 시작일과 종료일을 그대로 코어뱅킹으로 전달한다")
    void findTransactionsWithCustomPeriod() {
        Long userId = 1L;
        Long accountId = 2001L;
        LocalDate from = LocalDate.of(2026, 5, 10);
        LocalDate to = LocalDate.of(2026, 6, 2);
        AccountRef accountRef = AccountRef.builder()
                .accountRefId(1L)
                .user(User.builder().userId(userId).build())
                .accountId(accountId)
                .hasAccount(true)
                .build();
        CoreBankingTransactionsResponse coreResponse = new CoreBankingTransactionsResponse(
                accountId,
                List.of(),
                1,
                20,
                false
        );

        when(accountRefRepository.findByUser_UserIdAndAccountId(userId, accountId))
                .thenReturn(Optional.of(accountRef));
        when(coreBankingClient.findAccountTransactions(any())).thenReturn(coreResponse);

        BankingTransactionsResponse response = bankingService.findTransactions(
                userId,
                accountId,
                TransactionPeriod.CUSTOM,
                TransactionFlowFilter.WITHDRAWAL,
                from,
                to,
                PageRequest.of(1, 20)
        );

        ArgumentCaptor<CoreBankingTransactionQuery> captor = ArgumentCaptor.forClass(CoreBankingTransactionQuery.class);
        verify(coreBankingClient).findAccountTransactions(captor.capture());
        CoreBankingTransactionQuery query = captor.getValue();
        assertThat(query.from()).isEqualTo(from);
        assertThat(query.to()).isEqualTo(to);
        assertThat(query.flow()).isEqualTo(TransactionFlowFilter.WITHDRAWAL);
        assertThat(query.page()).isEqualTo(1);
        assertThat(query.size()).isEqualTo(20);
        assertThat(response.period()).isEqualTo(TransactionPeriod.CUSTOM);
    }

    @Test
    @DisplayName("고정 조회 기간에 직접 입력 날짜가 함께 전달되면 잘못된 요청으로 처리한다")
    void findTransactionsRejectsCustomDatesWithFixedPeriod() {
        Long userId = 1L;
        Long accountId = 2001L;
        AccountRef accountRef = AccountRef.builder()
                .accountRefId(1L)
                .user(User.builder().userId(userId).build())
                .accountId(accountId)
                .hasAccount(true)
                .build();

        when(accountRefRepository.findByUser_UserIdAndAccountId(userId, accountId))
                .thenReturn(Optional.of(accountRef));

        assertThatThrownBy(() -> bankingService.findTransactions(
                userId,
                accountId,
                TransactionPeriod.ONE_MONTH,
                TransactionFlowFilter.ALL,
                LocalDate.of(2026, 5, 1),
                LocalDate.of(2026, 6, 1),
                PageRequest.of(0, 20)
        ))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(BAD_REQUEST);

        verify(coreBankingClient, never()).findAccountTransactions(any());
    }

    @Test
    @DisplayName("본인 계좌가 아니면 거래내역 조회를 코어뱅킹에 요청하지 않는다")
    void findTransactionsAccountNotFound() {
        Long userId = 1L;
        Long accountId = 2001L;
        when(accountRefRepository.findByUser_UserIdAndAccountId(userId, accountId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> bankingService.findTransactions(
                userId,
                accountId,
                TransactionPeriod.ONE_MONTH,
                TransactionFlowFilter.ALL,
                null,
                null,
                PageRequest.of(0, 20)
        ))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(BANKING_ACCOUNT_NOT_FOUND);

        verify(coreBankingClient, never()).findAccountTransactions(any());
    }
}
