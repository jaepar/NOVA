package woorifisa.project.coreBanking.domain.globalTransaction.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import woorifisa.project.coreBanking.domain.account.entity.Account;
import woorifisa.project.coreBanking.domain.account.entity.enums.AccountType;
import woorifisa.project.coreBanking.domain.account.entity.enums.BankCode;
import woorifisa.project.coreBanking.domain.account.repository.AccountRepository;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionFlow;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionType;
import woorifisa.project.coreBanking.domain.accountTransaction.repository.AccountTransactionRepository;
import woorifisa.project.coreBanking.domain.customer.entity.Customer;
import woorifisa.project.coreBanking.domain.customer.repository.CustomerRepository;
import woorifisa.project.coreBanking.domain.globalTransaction.dto.request.CreateGlobalTransactionRequest;
import woorifisa.project.coreBanking.domain.globalTransaction.dto.response.CreateGlobalTransactionResponse;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.GlobalTransaction;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.CurrencyCode;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionStatus;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.MediaryFeePayer;
import woorifisa.project.coreBanking.domain.globalTransaction.repository.GlobalTransactionRepository;
import woorifisa.project.coreBanking.global.exception.CustomException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GlobalTransactionServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private AccountTransactionRepository accountTransactionRepository;

    @Mock
    private GlobalTransactionRepository globalTransactionRepository;

    @Mock
    private GlobalTransactionFdsService globalTransactionFdsService;

    @InjectMocks
    private GlobalTransactionService globalTransactionService;

    private Customer customer;
    private Account account;
    private CreateGlobalTransactionRequest request;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .customerId(1001L)
                .name("PARK JAEHA")
                .email("jaeha@example.com")
                .build();
        account = Account.builder()
                .accountId(2001L)
                .customer(customer)
                .accountType(AccountType.DEMAND_DEPOSIT)
                .hasLimit(false)
                .accountNumber("1002312345678")
                .accountName("우리 SUPER주거래 통장")
                .balance(2_000_000)
                .password("1234")
                .transferLimit(3_000_000)
                .bankCode(BankCode.WOORI)
                .build();
        request = request("global-remittance-1", "1380500");
    }

    @Test
    @DisplayName("해외송금 생성은 선출금 후 PENDING 원장을 저장하고 FDS 비동기 심사를 요청한다")
    void createPendingGlobalTransaction() {
        when(globalTransactionRepository.findByExternalRequestId("global-remittance-1"))
                .thenReturn(Optional.empty());
        when(customerRepository.findById(1001L)).thenReturn(Optional.of(customer));
        when(accountRepository.findByAccountIdAndCustomer_CustomerId(2001L, 1001L))
                .thenReturn(Optional.of(account));
        when(globalTransactionRepository.save(any(GlobalTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CreateGlobalTransactionResponse response = globalTransactionService.create(request);

        assertThat(response.status()).isEqualTo(GlobalTransactionStatus.PENDING);
        assertThat(account.getBalance()).isEqualTo(619_500);

        ArgumentCaptor<AccountTransaction> transactionCaptor = ArgumentCaptor.forClass(AccountTransaction.class);
        verify(accountTransactionRepository).save(transactionCaptor.capture());
        assertThat(transactionCaptor.getValue().getTransactionFlow()).isEqualTo(TransactionFlow.WITHDRAWAL);
        assertThat(transactionCaptor.getValue().getTransactionType()).isEqualTo(TransactionType.GLOBAL_REMITTANCE);
        assertThat(transactionCaptor.getValue().getAmount()).isEqualTo(1_380_500);
        assertThat(transactionCaptor.getValue().getBalanceAfter()).isEqualTo(619_500);

        verify(globalTransactionRepository).save(any(GlobalTransaction.class));
        verify(globalTransactionFdsService).screenAsync(any());
    }

    @Test
    @DisplayName("동일 외부 요청 ID는 추가 출금 없이 기존 원장을 반환한다")
    void createIdempotently() {
        GlobalTransaction existing = GlobalTransaction.builder()
                .globalTransactionId(1L)
                .externalRequestId("global-remittance-1")
                .status(GlobalTransactionStatus.PENDING)
                .build();
        when(globalTransactionRepository.findByExternalRequestId("global-remittance-1"))
                .thenReturn(Optional.of(existing));

        CreateGlobalTransactionResponse response = globalTransactionService.create(request);

        assertThat(response.globalTransactionId()).isEqualTo(1L);
        assertThat(response.status()).isEqualTo(GlobalTransactionStatus.PENDING);
        assertThat(account.getBalance()).isEqualTo(2_000_000);
        verify(accountTransactionRepository, never()).save(any());
        verify(globalTransactionFdsService, never()).screenAsync(any(Long.class));
    }

    @Test
    @DisplayName("계좌 락 획득 후 동일 외부 요청 ID가 생성되었으면 추가 출금 없이 기존 원장을 반환한다")
    void createIdempotentlyAfterAccountLock() {
        GlobalTransaction existing = GlobalTransaction.builder()
                .globalTransactionId(1L)
                .externalRequestId("global-remittance-1")
                .status(GlobalTransactionStatus.PENDING)
                .build();
        when(globalTransactionRepository.findByExternalRequestId("global-remittance-1"))
                .thenReturn(Optional.empty(), Optional.of(existing));
        when(customerRepository.findById(1001L)).thenReturn(Optional.of(customer));
        when(accountRepository.findByAccountIdAndCustomer_CustomerId(2001L, 1001L))
                .thenReturn(Optional.of(account));

        CreateGlobalTransactionResponse response = globalTransactionService.create(request);

        assertThat(response.globalTransactionId()).isEqualTo(1L);
        assertThat(account.getBalance()).isEqualTo(2_000_000);
        verify(accountTransactionRepository, never()).save(any());
        verify(globalTransactionFdsService, never()).screenAsync(any(Long.class));
    }

    @Test
    @DisplayName("동시 요청으로 원장 저장 충돌이 발생하면 기존 원장을 조회해 반환한다")
    void createRecoversFromConcurrentInsertConflict() {
        GlobalTransaction existing = GlobalTransaction.builder()
                .globalTransactionId(1L)
                .externalRequestId("global-remittance-1")
                .status(GlobalTransactionStatus.PENDING)
                .build();
        when(globalTransactionRepository.findByExternalRequestId("global-remittance-1"))
                .thenReturn(Optional.empty(), Optional.empty(), Optional.of(existing));
        when(customerRepository.findById(1001L)).thenReturn(Optional.of(customer));
        when(accountRepository.findByAccountIdAndCustomer_CustomerId(2001L, 1001L))
                .thenReturn(Optional.of(account));
        when(globalTransactionRepository.save(any(GlobalTransaction.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate external request id"));

        CreateGlobalTransactionResponse response = globalTransactionService.create(request);

        assertThat(response.globalTransactionId()).isEqualTo(1L);
        assertThat(response.status()).isEqualTo(GlobalTransactionStatus.PENDING);
        verify(globalTransactionFdsService, never()).screenAsync(any(Long.class));
    }

    @Test
    @DisplayName("원화 금액이 잔액보다 크면 해외송금 생성에 실패한다")
    void createFailsWhenBalanceInsufficient() {
        CreateGlobalTransactionRequest tooLarge = request("global-remittance-2", "3000000");
        when(globalTransactionRepository.findByExternalRequestId("global-remittance-2"))
                .thenReturn(Optional.empty());
        when(customerRepository.findById(1001L)).thenReturn(Optional.of(customer));
        when(accountRepository.findByAccountIdAndCustomer_CustomerId(2001L, 1001L))
                .thenReturn(Optional.of(account));

        assertThatThrownBy(() -> globalTransactionService.create(tooLarge))
                .isInstanceOf(CustomException.class);
        verify(accountTransactionRepository, never()).save(any());
        verify(globalTransactionRepository, never()).save(any());
    }

    private CreateGlobalTransactionRequest request(String externalRequestId, String krwAmount) {
        return new CreateGlobalTransactionRequest(
                externalRequestId,
                1001L,
                2001L,
                "생활비 송금",
                "US",
                CurrencyCode.USD,
                "1000.00",
                MediaryFeePayer.SENDER,
                new BigDecimal("1380.500000"),
                krwAmount,
                "PARK JAEHA",
                "+821012345678",
                "101",
                "Gwangjin-gu",
                "Seoul",
                "05029",
                "KR",
                "JOHN SMITH",
                "Apt 10",
                "Manhattan",
                "New York",
                null,
                "+12125550100",
                "BOFAUS3N",
                "1234567890",
                "026009593",
                "Bank of America",
                "LIVING_EXPENSE"
        );
    }
}
