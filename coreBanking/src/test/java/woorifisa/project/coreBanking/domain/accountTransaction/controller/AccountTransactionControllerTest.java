package woorifisa.project.coreBanking.domain.accountTransaction.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.DebitWalletAccountRequest;
import woorifisa.project.coreBanking.domain.accountTransaction.service.AccountTransactionService;
import woorifisa.project.coreBanking.global.exception.CustomException;
import woorifisa.project.coreBanking.global.exception.handler.GlobalControllerAdvice;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.WALLET_ACCOUNT_DEBIT_INVALID_REQUEST;

class AccountTransactionControllerTest {

    private final AccountTransactionService accountTransactionService = mock(AccountTransactionService.class);
    private final MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new AccountTransactionController(accountTransactionService))
            .setControllerAdvice(new GlobalControllerAdvice())
            .build();

    @Test
    @DisplayName("월렛 충전 계좌차감 요청을 서비스로 전달하고 공통 성공 응답을 반환한다")
    void success() throws Exception {
        mockMvc.perform(post("/account-transactions/wallet")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "walletChargeRequestId": "WCR-20260514-0001",
                                  "customerId": 1001,
                                  "withdrawAccountId": 2001,
                                  "chargeAmount": 10000
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("20000"))
                .andExpect(jsonPath("$.message").value("요청에 성공했습니다."))
                .andExpect(jsonPath("$.data").doesNotExist());

        ArgumentCaptor<DebitWalletAccountRequest> requestCaptor = forClass(DebitWalletAccountRequest.class);
        verify(accountTransactionService).debitWalletCharge(requestCaptor.capture());
        DebitWalletAccountRequest request = requestCaptor.getValue();
        assertThat(request.walletChargeRequestId()).isEqualTo("WCR-20260514-0001");
        assertThat(request.customerId()).isEqualTo(1001L);
        assertThat(request.withdrawAccountId()).isEqualTo(2001L);
        assertThat(request.chargeAmount()).isEqualTo(10000L);
    }

    @Test
    @DisplayName("월렛 충전 계좌차감 실패 예외를 공통 예외 응답으로 반환한다")
    void fail() throws Exception {
        doThrow(new CustomException(WALLET_ACCOUNT_DEBIT_INVALID_REQUEST))
                .when(accountTransactionService)
                .debitWalletCharge(any(DebitWalletAccountRequest.class));

        mockMvc.perform(post("/account-transactions/wallet")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "walletChargeRequestId": "",
                                  "customerId": 1001,
                                  "withdrawAccountId": 2001,
                                  "chargeAmount": 10000
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("WALLET_ACCOUNT_DEBIT-001"))
                .andExpect(jsonPath("$.message").value("계좌 차감 요청이 올바르지 않습니다."));
    }
}
