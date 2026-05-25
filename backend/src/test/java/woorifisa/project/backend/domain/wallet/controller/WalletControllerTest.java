package woorifisa.project.backend.domain.wallet.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.domain.wallet.dto.response.WalletTransactionItem;
import woorifisa.project.backend.domain.wallet.dto.response.WalletTransactionsResponse;
import woorifisa.project.backend.domain.wallet.entity.enums.TransactionFlow;
import woorifisa.project.backend.domain.wallet.service.WalletService;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(WalletController.class)
class WalletControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private WalletService walletService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @DisplayName("세션 사용자 기준 월렛 잔액과 거래내역을 조회한다")
    void success() throws Exception {
        Long userId = 1L;
        WalletTransactionsResponse response = new WalletTransactionsResponse(
                12500,
                List.of(new WalletTransactionItem(
                        102L,
                        TransactionFlow.WITHDRAWAL,
                        "이마트24 강남역점",
                        2500,
                        LocalDateTime.of(2025, 5, 24, 14, 22)
                ))
        );

        when(walletService.findWalletTransactions(any())).thenReturn(response);
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                new SessionUserPrincipal(userId),
                null,
                AuthorityUtils.NO_AUTHORITIES
        );

        mockMvc.perform(get("/wallet/transactions")
                        .with(authentication(authToken))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value(20000))
                .andExpect(jsonPath("$.data.balance").value(12500))
                .andExpect(jsonPath("$.data.transactions", hasSize(1)))
                .andExpect(jsonPath("$.data.transactions[0].walletTransactionId").value(102))
                .andExpect(jsonPath("$.data.transactions[0].transactionFlow").value("WITHDRAWAL"))
                .andExpect(jsonPath("$.data.transactions[0].counterparty").value("이마트24 강남역점"))
                .andExpect(jsonPath("$.data.transactions[0].amount").value(2500))
                .andExpect(jsonPath("$.data.transactions[0].createdAt").value("2025-05-24T14:22:00"));
    }
}
