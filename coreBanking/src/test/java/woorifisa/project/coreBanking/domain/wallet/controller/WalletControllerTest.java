package woorifisa.project.coreBanking.domain.wallet.controller;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import woorifisa.project.coreBanking.domain.wallet.dto.request.DebitWalletAccountRequest;
import woorifisa.project.coreBanking.domain.wallet.dto.response.DebitWalletAccountResponse;
import woorifisa.project.coreBanking.domain.wallet.service.WalletService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class WalletControllerTest {

    private final WalletService walletService = mock(WalletService.class);
    private final MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new WalletController(walletService)).build();

    @Test
    void postsWalletChargeDebitRequestToService() throws Exception {
        when(walletService.debitWalletCharge(any(DebitWalletAccountRequest.class)))
                .thenReturn(new DebitWalletAccountResponse(true, 20000, "계좌 차감이 완료되었습니다."));

        mockMvc.perform(post("/wallet/charges/debit")
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
                .andExpect(jsonPath("$.code").value(20000))
                .andExpect(jsonPath("$.message").value("계좌 차감이 완료되었습니다."));

        ArgumentCaptor<DebitWalletAccountRequest> requestCaptor = forClass(DebitWalletAccountRequest.class);
        verify(walletService).debitWalletCharge(requestCaptor.capture());
        DebitWalletAccountRequest request = requestCaptor.getValue();
        assertThat(request.walletChargeRequestId()).isEqualTo("WCR-20260514-0001");
        assertThat(request.customerId()).isEqualTo(1001L);
        assertThat(request.withdrawAccountId()).isEqualTo(2001L);
        assertThat(request.chargeAmount()).isEqualTo(10000L);
    }

    @Test
    void returnsServiceFailureResponseBody() throws Exception {
        when(walletService.debitWalletCharge(any(DebitWalletAccountRequest.class)))
                .thenReturn(new DebitWalletAccountResponse(false, 40000, "계좌 차감 요청이 올바르지 않습니다."));

        mockMvc.perform(post("/wallet/charges/debit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "walletChargeRequestId": "",
                                  "customerId": 1001,
                                  "withdrawAccountId": 2001,
                                  "chargeAmount": 10000
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value(40000))
                .andExpect(jsonPath("$.message").value("계좌 차감 요청이 올바르지 않습니다."));
    }
}
