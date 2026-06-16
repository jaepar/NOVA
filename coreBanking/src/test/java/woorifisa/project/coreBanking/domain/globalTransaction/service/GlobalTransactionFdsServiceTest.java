package woorifisa.project.coreBanking.domain.globalTransaction.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import woorifisa.project.coreBanking.domain.account.entity.Account;
import woorifisa.project.coreBanking.domain.account.entity.enums.AccountType;
import woorifisa.project.coreBanking.domain.account.entity.enums.BankCode;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionFlow;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionType;
import woorifisa.project.coreBanking.domain.accountTransaction.repository.AccountTransactionRepository;
import woorifisa.project.coreBanking.domain.customer.entity.Customer;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.GlobalTransaction;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.CurrencyCode;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionFailureReason;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionStatus;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.MediaryFeePayer;
import woorifisa.project.coreBanking.domain.globalTransaction.fds.client.FdsClient;
import woorifisa.project.coreBanking.domain.globalTransaction.fds.dto.FdsGlobalTransactionScreeningRequest;
import woorifisa.project.coreBanking.domain.globalTransaction.fds.dto.FdsGlobalTransactionScreeningResponse;
import woorifisa.project.coreBanking.domain.globalTransaction.repository.GlobalTransactionRepository;
import woorifisa.project.coreBanking.global.exception.CustomException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GlobalTransactionFdsServiceTest {

    @Mock
    private FdsClient fdsClient;

    @Mock
    private GlobalTransactionRepository globalTransactionRepository;

    @Mock
    private AccountTransactionRepository accountTransactionRepository;

    @InjectMocks
    private GlobalTransactionFdsService globalTransactionFdsService;

    @Test
    @DisplayName("FDS 성공 응답이면 해외송금 상태를 SUCCESS로 변경한다")
    void markSuccessWhenFdsSuccess() {
        GlobalTransaction transaction = pendingTransaction();
        when(globalTransactionRepository.findById(1L)).thenReturn(Optional.of(transaction));
        when(fdsClient.screen(any(FdsGlobalTransactionScreeningRequest.class)))
                .thenReturn(new FdsGlobalTransactionScreeningResponse(
                        1L,
                        GlobalTransactionStatus.SUCCESS,
                        null,
                        -0.1,
                        -0.2
                ));

        globalTransactionFdsService.screenAsync(1L);

        assertThat(transaction.getStatus()).isEqualTo(GlobalTransactionStatus.SUCCESS);
        assertThat(transaction.getFailureReason()).isNull();
        verify(accountTransactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("FDS 위험 판정이면 FAILED로 변경하고 출금 금액을 환급한다")
    void refundWhenFdsRiskDetected() {
        GlobalTransaction transaction = pendingTransaction();
        when(globalTransactionRepository.findById(1L)).thenReturn(Optional.of(transaction));
        when(fdsClient.screen(any(FdsGlobalTransactionScreeningRequest.class)))
                .thenReturn(new FdsGlobalTransactionScreeningResponse(
                        1L,
                        GlobalTransactionStatus.FAILED,
                        GlobalTransactionFailureReason.FDS_RISK_DETECTED,
                        -0.3,
                        -0.2
                ));

        globalTransactionFdsService.screenAsync(1L);

        assertThat(transaction.getStatus()).isEqualTo(GlobalTransactionStatus.FAILED);
        assertThat(transaction.getFailureReason()).isEqualTo(GlobalTransactionFailureReason.FDS_RISK_DETECTED);
        assertThat(transaction.getAccount().getBalance()).isEqualTo(2_000_000);

        ArgumentCaptor<AccountTransaction> captor = ArgumentCaptor.forClass(AccountTransaction.class);
        verify(accountTransactionRepository).save(captor.capture());
        assertThat(captor.getValue().getTransactionFlow()).isEqualTo(TransactionFlow.DEPOSIT);
        assertThat(captor.getValue().getTransactionType()).isEqualTo(TransactionType.GLOBAL_REMITTANCE_REFUND);
        assertThat(captor.getValue().getAmount()).isEqualTo(1_380_500);
        assertThat(captor.getValue().getBalanceAfter()).isEqualTo(2_000_000);
        assertThat(captor.getValue().getExternalRequestId()).isEqualTo("global-remittance-1:refund");
    }

    @Test
    @DisplayName("FDS 통신 장애이면 FAILED로 변경하고 통신 장애 사유와 환급 내역을 남긴다")
    void refundWhenFdsCommunicationFails() {
        GlobalTransaction transaction = pendingTransaction();
        when(globalTransactionRepository.findById(1L)).thenReturn(Optional.of(transaction));
        when(fdsClient.screen(any(FdsGlobalTransactionScreeningRequest.class)))
                .thenThrow(new CustomException(
                        woorifisa.project.coreBanking.global.response.status.BaseResponseStatus
                                .GLOBAL_TRANSACTION_FDS_COMMUNICATION_FAILED
                ));

        globalTransactionFdsService.screenAsync(1L);

        assertThat(transaction.getStatus()).isEqualTo(GlobalTransactionStatus.FAILED);
        assertThat(transaction.getFailureReason())
                .isEqualTo(GlobalTransactionFailureReason.FDS_COMMUNICATION_FAILED);
        assertThat(transaction.getAccount().getBalance()).isEqualTo(2_000_000);
        verify(accountTransactionRepository).save(any(AccountTransaction.class));
    }

    private GlobalTransaction pendingTransaction() {
        Customer customer = Customer.builder()
                .customerId(1001L)
                .name("PARK JAEHA")
                .email("jaeha@example.com")
                .build();
        Account account = Account.builder()
                .accountId(2001L)
                .customer(customer)
                .accountType(AccountType.DEMAND_DEPOSIT)
                .hasLimit(false)
                .accountNumber("1002312345678")
                .accountName("우리 SUPER주거래 통장")
                .balance(619_500)
                .password("1234")
                .transferLimit(3_000_000)
                .bankCode(BankCode.WOORI)
                .build();
        return GlobalTransaction.builder()
                .globalTransactionId(1L)
                .customer(customer)
                .account(account)
                .remitPurpose("생활비 송금")
                .targetCountry("US")
                .currency(CurrencyCode.USD)
                .remitAmount("1000.00")
                .mediaryFeePayer(MediaryFeePayer.SENDER)
                .exchangeRate(new BigDecimal("1380.500000"))
                .krwAmount("1380500")
                .senderEngName("PARK JAEHA")
                .senderPhone("+821012345678")
                .senderAddressDetail("101")
                .senderDistrict("Gwangjin-gu")
                .senderCity("Seoul")
                .senderZipCode("05029")
                .senderCountry("KR")
                .receiverEngName("JOHN SMITH")
                .receiverAddressDetail("Apt 10")
                .receiverDistrict("Manhattan")
                .receiverCity("New York")
                .receiverZipCode(null)
                .receiverPhone("+12125550100")
                .swiftCode("BOFAUS3N")
                .receiverAccountNum("1234567890")
                .routingNumber("026009593")
                .bankName("Bank of America")
                .remitReason("LIVING_EXPENSE")
                .externalRequestId("global-remittance-1")
                .status(GlobalTransactionStatus.PENDING)
                .build();
    }
}
