package woorifisa.project.backend.domain.banking.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingTransferRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingRecipientLookupResponse;
import woorifisa.project.backend.domain.banking.dto.request.AccountPasswordVerifyRequest;
import woorifisa.project.backend.domain.banking.dto.request.RecipientLookupRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransferRequest;
import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.banking.repository.BankingRepository;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.global.exception.CustomException;

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
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_CORE_BANKING_COMMUNICATION_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_TRANSFER_PROCESSING;

@ExtendWith(MockitoExtension.class)
class BankingServiceTest {

    @Mock
    private BankingRepository bankingRepository;
    @Mock
    private StringRedisTemplate stringRedisTemplate;
    @Mock
    private ValueOperations<String, String> valueOperations;
    @Mock
    private CoreBankingTransferClient coreBankingTransferClient;

    private BankingService bankingService;

    @BeforeEach
    void setUp() {
        bankingService = new BankingService(
                bankingRepository,
                stringRedisTemplate,
                coreBankingTransferClient
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
                .hasAccount(true)
                .build();
        when(valueOperations.get("banking:transfer:result:key-1")).thenReturn(null);
        when(valueOperations.setIfAbsent(anyString(), anyString(), any())).thenReturn(true);
        when(bankingRepository.findByUser_UserIdAndAccountId(userId, 2001L)).thenReturn(Optional.of(accountRef));
        doNothing().when(coreBankingTransferClient).transfer(any());

        bankingService.transfer(userId, idempotencyKey, request);

        ArgumentCaptor<CoreBankingTransferRequest> captor = ArgumentCaptor.forClass(CoreBankingTransferRequest.class);
        verify(coreBankingTransferClient).transfer(captor.capture());
        CoreBankingTransferRequest coreRequest = captor.getValue();
        assertThat(coreRequest.withdrawAccountId()).isEqualTo(2001L);
        assertThat(coreRequest.depositAccountId()).isEqualTo(2002L);
        assertThat(coreRequest.externalRequestId()).isEqualTo(idempotencyKey);
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

        verify(coreBankingTransferClient, never()).transfer(any());
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

        verify(coreBankingTransferClient, never()).transfer(any());
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
                .hasAccount(true)
                .build();

        when(valueOperations.get("banking:transfer:result:key-lookup-exists")).thenReturn(null);
        when(valueOperations.setIfAbsent(anyString(), anyString(), any())).thenReturn(true);
        when(bankingRepository.findByUser_UserIdAndAccountId(userId, 2001L)).thenReturn(Optional.of(accountRef));
        doThrow(new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED)).when(coreBankingTransferClient).transfer(any());
        when(coreBankingTransferClient.existsTransferRequest(idempotencyKey))
                .thenReturn(false)
                .thenReturn(true);

        bankingService.transfer(userId, idempotencyKey, request);

        verify(coreBankingTransferClient, times(1)).transfer(any());
        verify(coreBankingTransferClient, times(2)).existsTransferRequest(idempotencyKey);
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
                .hasAccount(true)
                .build();

        when(valueOperations.get("banking:transfer:result:key-retry")).thenReturn(null);
        when(valueOperations.setIfAbsent(anyString(), anyString(), any())).thenReturn(true);
        when(bankingRepository.findByUser_UserIdAndAccountId(userId, 2001L)).thenReturn(Optional.of(accountRef));
        doThrow(new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED))
                .doNothing()
                .when(coreBankingTransferClient).transfer(any());
        when(coreBankingTransferClient.existsTransferRequest(idempotencyKey)).thenReturn(false);

        bankingService.transfer(userId, idempotencyKey, request);

        verify(coreBankingTransferClient, times(2)).transfer(any());
        verify(coreBankingTransferClient, times(2)).existsTransferRequest(idempotencyKey);
    }

    @Test
    @DisplayName("수취인 조회 시 코어뱅킹 응답의 recipientName을 반환한다")
    void lookupRecipientSuccess() {
        when(coreBankingTransferClient.lookupRecipient(any()))
                .thenReturn(new CoreBankingRecipientLookupResponse("백민정"));

        var response = bankingService.lookupRecipient(new RecipientLookupRequest("busan", "1122261925003"));

        assertThat(response.recipientName()).isEqualTo("백민정");
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

        when(bankingRepository.findByUser_UserIdAndAccountId(userId, 2001L)).thenReturn(Optional.of(accountRef));
        doNothing().when(coreBankingTransferClient).verifyAccountPassword(any());

        bankingService.verifyAccountPassword(userId, new AccountPasswordVerifyRequest(2001L, "1234"));

        verify(coreBankingTransferClient).verifyAccountPassword(any());
    }
}
