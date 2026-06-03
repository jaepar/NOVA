package woorifisa.project.backend.domain.banking.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingPasswordVerifyRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingTransferRequest;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingRecipientLookupResponse;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingCreateAccountResponse;
import woorifisa.project.backend.domain.banking.dto.request.AccountCreateRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransferPreviewRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransferRequest;
import woorifisa.project.backend.domain.banking.dto.response.AccountHomeResponse;
import woorifisa.project.backend.domain.banking.dto.response.AccountCreateResponse;
import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.banking.repository.AccountRefRepository;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.CertificateStatus;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.corebanking.client.CoreBankingClient;
import woorifisa.project.backend.global.exception.CustomException;

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
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_ACCOUNT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_CORE_BANKING_COMMUNICATION_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_CERTIFICATE_REQUIRED;
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
                .user(User.builder().userId(userId).build())
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
        assertThat(response.accountNumber()).isEqualTo("1002867390781");
        assertThat(response.bankName()).isEqualTo("우리은행");
        assertThat(response.balance()).isEqualTo(50000);
        assertThat(response.hasLimit()).isTrue();
    }

    @Test
    @DisplayName("홈 계좌 조회 시 계좌가 없으면 예외를 반환한다")
    void findHomeAccountNotFound() {
        Long userId = 1L;
        when(accountRefRepository.findFirstByUser_UserIdAndHasAccountTrueOrderByAccountRefIdAsc(userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> bankingService.findHomeAccount(userId))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(BANKING_ACCOUNT_NOT_FOUND);
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
        CoreBankingTransferRequest coreRequest = captor.getValue();
        assertThat(coreRequest.withdrawAccountId()).isEqualTo(2001L);
        assertThat(coreRequest.depositAccountId()).isEqualTo(2002L);
        assertThat(coreRequest.externalRequestId()).isEqualTo(idempotencyKey);
        assertThat(accountRef.getBalance()).isEqualTo(5000);
        verify(stringRedisTemplate).delete("banking:transfer:processing:key-1");
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
    @DisplayName("동일 멱등키가 이미 처리중이면 예외를 반환한다")
    void transferProcessing() {
        when(valueOperations.get("banking:transfer:result:key-1")).thenReturn(null);
        when(valueOperations.setIfAbsent(anyString(), anyString(), any())).thenReturn(false);

        assertThatThrownBy(() -> bankingService.transfer(1L, "key-1",
                new TransferRequest(2001L, 2002L, 5000, "1234", "박재하", "박재하")))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(BANKING_TRANSFER_PROCESSING);

        verify(coreBankingClient, never()).transfer(any());
    }

    @Test
    @DisplayName("같은 출금 계좌가 이미 처리중이면 예외를 반환한다")
    void transferProcessingByAccountLock() {
        Long userId = 1L;
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
                new TransferRequest(2001L, 2002L, 5000, "1234", "박재하", "박재하")
        );

        verify(coreBankingClient, never()).transfer(any());
    }

    @Test
    @DisplayName("코어뱅킹 이체 호출이 실패해도 요청 결과 조회에서 존재하면 성공 처리한다")
    void transferSuccessWhenLookupExistsAfterFailure() {
        Long userId = 1L;
        String idempotencyKey = "key-lookup-exists";
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
                new CoreBankingCreateAccountResponse(2001L, 1001L, "우리 SUPER주거래 통장", "1002-312-345678")
        );

        AccountCreateResponse response = bankingService.createAccount(userId, request);

        assertThat(response.accountId()).isEqualTo(2001L);
        assertThat(response.bankCode()).isEqualTo("WOORI");
        assertThat(response.accountNumber()).isEqualTo("1002-312-345678");
        verify(accountRefRepository).save(any(AccountRef.class));
    }

    @Test
    @DisplayName("인증서 발급 완료 상태가 아니면 계좌 개설에 실패한다")
    void createAccountFailsWhenCertificateIsNotIssued() {
        Long userId = 1L;
        User user = User.builder()
                .userId(userId)
                .name("PARK JAEHA")
                .email("abcdef@gmail.com")
                .certificateStatus(CertificateStatus.NOT_ISSUED)
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

        assertThatThrownBy(() -> bankingService.createAccount(userId, request))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(BANKING_CERTIFICATE_REQUIRED);

        verify(coreBankingClient, never()).createAccount(any());
    }
}
