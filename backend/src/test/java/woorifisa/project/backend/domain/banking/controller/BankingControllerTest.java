package woorifisa.project.backend.domain.banking.controller;

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
import woorifisa.project.backend.domain.banking.dto.response.AccountCreateResponse;
import woorifisa.project.backend.domain.banking.service.BankingService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BankingController.class)
class BankingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BankingService bankingService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @DisplayName("세션 사용자 기준으로 계좌 개설 요청을 처리한다")
    void createAccountSuccess() throws Exception {
        Long userId = 1L;
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                new SessionUserPrincipal(userId),
                null,
                AuthorityUtils.NO_AUTHORITIES
        );

        when(bankingService.createAccount(any(), any()))
                .thenReturn(AccountCreateResponse.of(2001L, "WOORI", "1002-312-345678"));

        mockMvc.perform(post("/banking")
                        .with(authentication(authToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "accountType": "DEMAND_DEPOSIT",
                                  "accountName": "우리 SUPER주거래 통장",
                                  "customerInfo": {
                                    "address": "서울특별시 광진구 능동로 120",
                                    "addressDetail": "건국대학교 기숙사 101호"
                                  },
                                  "job": "STUDENT",
                                  "transactionInfo": {
                                    "purpose": "SALARY_AND_LIVING_EXPENSES",
                                    "source": "EARNED_AND_PENSION_INCOME"
                                  },
                                  "hasForeignTax": false,
                                  "accountPassword": "1234"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("20000"))
                .andExpect(jsonPath("$.data.accountId").value(2001))
                .andExpect(jsonPath("$.data.bankCode").value("WOORI"))
                .andExpect(jsonPath("$.data.accountNumber").value("1002-312-345678"));
    }

    @Test
    @DisplayName("세션 사용자와 멱등키 기준으로 계좌 이체 요청을 처리한다")
    void transferSuccess() throws Exception {
        Long userId = 1L;
        String idempotencyKey = "550e8400-e29b-41d4-a716-446655440000";

        doNothing().when(bankingService).transfer(any(), any(), any());
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                new SessionUserPrincipal(userId),
                null,
                AuthorityUtils.NO_AUTHORITIES
        );

        mockMvc.perform(post("/banking/transfers")
                        .with(authentication(authToken))
                        .header("Idempotency-Key", idempotencyKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "withdrawAccountId": 2001,
                                  "depositAccountId": 2002,
                                  "transferAmount": 5000,
                                  "withdrawMemo": "박재하",
                                  "depositMemo": "박재하"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("20000"))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @DisplayName("이체 사전 조회 요청을 처리하고 내 계좌/수취인 정보를 반환한다")
    void previewTransferSuccess() throws Exception {
        Long userId = 1L;
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                new SessionUserPrincipal(userId),
                null,
                AuthorityUtils.NO_AUTHORITIES
        );

        when(bankingService.previewTransfer(any(), any()))
                .thenReturn(
                        woorifisa.project.backend.domain.banking.dto.response.TransferPreviewResponse.of(
                                "우리SUPER주거래통장",
                                "1002867390781",
                                "백민정"
                        )
                );

        mockMvc.perform(post("/banking/transfers/preview")
                        .with(authentication(authToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "recipientBankCode": "BUSAN",
                                  "recipientAccountNumber": "1122261925003"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("20000"))
                .andExpect(jsonPath("$.data.myAccount.accountName").value("우리SUPER주거래통장"))
                .andExpect(jsonPath("$.data.myAccount.accountNumber").value("1002867390781"))
                .andExpect(jsonPath("$.data.recipient.recipientName").value("백민정"));
    }

    @Test
    @DisplayName("계좌 비밀번호 검증 요청을 처리한다")
    void verifyAccountPasswordSuccess() throws Exception {
        Long userId = 1L;
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                new SessionUserPrincipal(userId),
                null,
                AuthorityUtils.NO_AUTHORITIES
        );
        doNothing().when(bankingService).verifyAccountPassword(any(), any());

        mockMvc.perform(post("/banking/password/verify")
                        .with(authentication(authToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "accountId": 1,
                                  "accountPassword": "1234"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("20000"))
                .andExpect(jsonPath("$.data").doesNotExist());
    }
}
