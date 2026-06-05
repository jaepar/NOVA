package woorifisa.project.backend.domain.banking.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import woorifisa.project.backend.domain.banking.dto.request.AccountCreateRequest;
import woorifisa.project.backend.domain.banking.dto.request.AccountPasswordVerifyRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransactionFlowFilter;
import woorifisa.project.backend.domain.banking.dto.request.TransactionPeriod;
import woorifisa.project.backend.domain.banking.dto.request.TransferPreviewRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransferRequest;
import woorifisa.project.backend.domain.banking.dto.request.UpdateTransactionMemoRequest;
import woorifisa.project.backend.domain.banking.dto.response.AccountCreateResponse;
import woorifisa.project.backend.domain.banking.dto.response.AccountHomeResponse;
import woorifisa.project.backend.domain.banking.dto.response.BankingTransactionsResponse;
import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.banking.repository.AccountRefRepository;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.CertificateStatus;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.corebanking.client.CoreBankingClient;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingPasswordVerifyRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingTransactionQuery;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingTransferRequest;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingCreateAccountResponse;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingRecipientLookupResponse;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingTransactionsResponse;
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
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BAD_REQUEST;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_ACCOUNT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_CERTIFICATE_REQUIRED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_CORE_BANKING_COMMUNICATION_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_TRANSACTION_MEMO_TOO_LONG;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_TRANSFER_PROCESSING;

@ExtendWith(MockitoExtension.class)
class BankingServiceTest {

    @Mock
    private AccountRefRepository accountRefRepository;
    @Mock
    private StringRedisTemplate stringRedisTemplate;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ValueOperations<String, String> valueOperations;
    @Mock
    private CoreBankingClient coreBankingClient;

    private BankingService bankingService;

    @BeforeEach
    void setUp() {
        bankingService = new BankingService(
                accountRefRepository,
                userRepository,
                stringRedisTemplate,
                coreBankingClient
        );
        lenient().when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    @DisplayName("홈 계좌 조회 시 본인 계좌 카드 정보를 반환한다")
    void findHomeAccountSuccess() {
        Long userId = 1L;
        AccountRef accountRef = AccountRef.builder()
                .accountRefId(1L)
                .user(User.builder().userId(userId).certificateStatus(CertificateStatus.ISSUED).build())
                .accountId(2001L)
                .accountName("NOVA 임시 제한 계좌")
                .accountNumber("1002867390781")
                .balance(50000)
                .hasAccount(true)
                .hasLimit(true)
                .build();
        when(accountRefRepository.findFirstByUser_UserIdAndHasAccountTrueOrderByAccountRefIdAsc(userId))
                .thenReturn(Optional.of(accountRef));

        AccountHomeResponse response = bankingService.findHomeAccount(userId);

        assertThat(response.accountId()).isEqualTo(2001L);
        assertThat(response.accountName()).isEqualTo("NOVA 임시 제한 계좌");
    }

    @Test
    @DisplayName("멱등키 처리중 키를 획득하면 코어뱅킹 이체를 호출하고 결과를 캐시한다")
    void transferSuccess() {
        Long userId = 1L;
        String idempotencyKey = "key-1";
        TransferRequest request = new TransferRequest(2001L, 2002L, 5000, "1234", "박재하", "박재하");
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
        assertThat(captor.getValue().externalRequestId()).isEqualTo(idempotencyKey);
    }

    @Test
    @DisplayName("이체 전에 출금 계좌 비밀번호를 CoreBanking으로 검증한다")
    void verifiesAccountPasswordBeforeTransfer() {
        Long userId = 1L;
        String idempotencyKey = "key-password";
        TransferRequest request = new TransferRequest(2001L, 2002L, 5000, "1234", "박재하", "박재하");
        AccountRef accountRef = AccountRef.builder()
                .accountRefId(1L)
                .user(User.builder().userId(userId).build())
                .customerId(1001L)
                .accountId(2001L)
                .accountNumber("1122261925001")
                .balance(10000)
                .hasAccount(true)
                .build();
        when(valueOperations.get("banking:transfer:result:key-password")).thenReturn(null);
        when(valueOperations.setIfAbsent(anyString(), anyString(), any())).thenReturn(true);
        when(accountRefRepository.findByUser_UserIdAndAccountId(userId, 2001L)).thenReturn(Optional.of(accountRef));

        bankingService.transfer(userId, idempotencyKey, request);

        InOrder inOrder = inOrder(coreBankingClient);
        inOrder.verify(coreBankingClient).verifyAccountPassword(
                org.mockito.ArgumentMatchers.argThat((CoreBankingPasswordVerifyRequest passwordRequest) ->
                        passwordRequest.accountId().equals(2001L)
                                && passwordRequest.accountPassword().equals("1234"))
        );
        inOrder.verify(coreBankingClient).transfer(any());
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
                .balance(50_000)
                .hasAccount(true)
                .transferLimit(300_000)
                .build();
        when(accountRefRepository.findFirstByUser_UserIdAndHasAccountTrueOrderByAccountRefIdAsc(userId))
                .thenReturn(Optional.of(accountRef));
        when(coreBankingClient.lookupRecipient(any()))
                .thenReturn(new CoreBankingRecipientLookupResponse("백민정"));

        var response = bankingService.previewTransfer(userId, new TransferPreviewRequest("BUSAN", "1122261925003"));

        assertThat(response.recipient().recipientName()).isEqualTo("백민정");
    }

    @Test
    @DisplayName("계좌 개설 요청 시 코어뱅킹 연동 후 계좌 참조를 저장한다")
    void createAccountSuccess() {
        Long userId = 1L;
        User user = User.builder()
                .userId(userId)
                .name("PARK JAEHA")
                .email("abcdef@gmail.com")
                .certificateStatus(CertificateStatus.ISSUED)
                .build();
        AccountCreateRequest request = new AccountCreateRequest(
                "DEMAND_DEPOSIT",
                "우리 SUPER주거래 통장",
                new AccountCreateRequest.CustomerInfo("서울특별시 광진구 능동로 120", "건국대학교 기숙사 101호"),
                "STUDENT",
                new AccountCreateRequest.TransactionInfo("SALARY_AND_LIVING_EXPENSES", "EARNED_AND_PENSION_INCOME"),
                false,
                "1234"
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(coreBankingClient.createAccount(any())).thenReturn(
                new CoreBankingCreateAccountResponse(2001L, 1001L, "우리 SUPER주거래 통장", "1002-312-345678", 300_000)
        );

        AccountCreateResponse response = bankingService.createAccount(userId, request);

        assertThat(response.accountId()).isEqualTo(2001L);
    }

    @Test
    @DisplayName("거래내역 조회 요청을 기간/유형/페이지 조건과 함께 코어뱅킹으로 전달한다")
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

        when(accountRefRepository.findByUser_UserIdAndAccountId(userId, accountId)).thenReturn(Optional.of(accountRef));
        when(coreBankingClient.findAccountTransactions(any())).thenReturn(coreResponse);

        BankingTransactionsResponse response = bankingService.findTransactions(
                userId,
                accountId,
                TransactionPeriod.ONE_MONTH,
                TransactionFlowFilter.ALL,
                null,
                null,
                null,
                Sort.Direction.DESC,
                pageable
        );

        ArgumentCaptor<CoreBankingTransactionQuery> captor = ArgumentCaptor.forClass(CoreBankingTransactionQuery.class);
        verify(coreBankingClient).findAccountTransactions(captor.capture());
        assertThat(captor.getValue().accountId()).isEqualTo(accountId);
        assertThat(captor.getValue().keyword()).isNull();
        assertThat(response.transactions()).hasSize(1);
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
        when(accountRefRepository.findByUser_UserIdAndAccountId(userId, accountId)).thenReturn(Optional.of(accountRef));
        when(coreBankingClient.findAccountTransactions(any())).thenReturn(
                new CoreBankingTransactionsResponse(accountId, List.of(), 1, 20, false)
        );

        bankingService.findTransactions(
                userId,
                accountId,
                TransactionPeriod.CUSTOM,
                TransactionFlowFilter.WITHDRAWAL,
                from,
                to,
                " rent ",
                Sort.Direction.ASC,
                PageRequest.of(1, 20)
        );

        ArgumentCaptor<CoreBankingTransactionQuery> captor = ArgumentCaptor.forClass(CoreBankingTransactionQuery.class);
        verify(coreBankingClient).findAccountTransactions(captor.capture());
        assertThat(captor.getValue().from()).isEqualTo(from);
        assertThat(captor.getValue().keyword()).isEqualTo("rent");
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
        when(accountRefRepository.findByUser_UserIdAndAccountId(userId, accountId)).thenReturn(Optional.of(accountRef));

        assertThatThrownBy(() -> bankingService.findTransactions(
                userId, accountId, TransactionPeriod.ONE_MONTH, TransactionFlowFilter.ALL,
                LocalDate.of(2026, 5, 1), LocalDate.of(2026, 6, 1), null, Sort.Direction.DESC, PageRequest.of(0, 20)
        )).isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(BAD_REQUEST);
    }

    @Test
    @DisplayName("본인 계좌가 아니면 거래내역 조회를 코어뱅킹에 요청하지 않는다")
    void findTransactionsAccountNotFound() {
        Long userId = 1L;
        Long accountId = 2001L;
        when(accountRefRepository.findByUser_UserIdAndAccountId(userId, accountId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bankingService.findTransactions(
                userId, accountId, TransactionPeriod.ONE_MONTH, TransactionFlowFilter.ALL,
                null, null, null, Sort.Direction.DESC, PageRequest.of(0, 20)
        )).isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(BANKING_ACCOUNT_NOT_FOUND);
    }

    @Test
    @DisplayName("거래내역 메모 수정 요청을 코어뱅킹으로 전달한다")
    void updateTransactionMemoSuccess() {
        Long transactionId = 9001L;
        UpdateTransactionMemoRequest request = new UpdateTransactionMemoRequest("  12345678901234567890  ");
        UpdateTransactionMemoRequest normalizedRequest = new UpdateTransactionMemoRequest("12345678901234567890");

        doNothing().when(coreBankingClient).updateTransactionMemo(transactionId, normalizedRequest);

        bankingService.updateTransactionMemo(transactionId, request);

        verify(coreBankingClient).updateTransactionMemo(transactionId, normalizedRequest);
    }

    @Test
    @DisplayName("거래내역 메모는 앞뒤 공백 제거 후 20자를 초과하면 예외를 반환한다")
    void updateTransactionMemoTooLong() {
        Long transactionId = 9001L;
        UpdateTransactionMemoRequest request = new UpdateTransactionMemoRequest("123456789012345678901");

        assertThatThrownBy(() -> bankingService.updateTransactionMemo(transactionId, request))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(BANKING_TRANSACTION_MEMO_TOO_LONG);
    }
}
