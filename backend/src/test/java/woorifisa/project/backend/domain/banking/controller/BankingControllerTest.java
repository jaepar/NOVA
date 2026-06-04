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
import woorifisa.project.backend.domain.banking.dto.request.TransactionFlowFilter;
import woorifisa.project.backend.domain.banking.dto.request.TransactionPeriod;
import woorifisa.project.backend.domain.banking.dto.response.BankingTransactionsResponse;
import woorifisa.project.backend.domain.banking.service.BankingService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;

import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

    @Test
    @DisplayName("거래내역 조회 요청을 기본 기간/유형/페이지 크기로 처리한다")
    void findTransactionsWithDefaults() throws Exception {
        Long userId = 1L;
        Long accountId = 2001L;
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                new SessionUserPrincipal(userId),
                null,
                AuthorityUtils.NO_AUTHORITIES
        );

        when(bankingService.findTransactions(any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new BankingTransactionsResponse(
                        accountId,
                        TransactionPeriod.ONE_MONTH,
                        TransactionFlowFilter.ALL,
                        List.of(new BankingTransactionsResponse.Transaction(
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
                ));

        mockMvc.perform(get("/banking/{accountId}/transactions", accountId)
                        .with(authentication(authToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("20000"))
                .andExpect(jsonPath("$.data.accountId").value(2001))
                .andExpect(jsonPath("$.data.period").value("ONE_MONTH"))
                .andExpect(jsonPath("$.data.flow").value("ALL"))
                .andExpect(jsonPath("$.data.transactions[0].transactionId").value(9001))
                .andExpect(jsonPath("$.data.transactions[0].counterParty").value("월렛 충전"))
                .andExpect(jsonPath("$.data.transactions[0].balanceAfter").value(50000))
                .andExpect(jsonPath("$.data.transactions[0].memo").value("충전"))
                .andExpect(jsonPath("$.data.page").value(0))
                .andExpect(jsonPath("$.data.size").value(20))
                .andExpect(jsonPath("$.data.hasNext").value(false));

        verify(bankingService).findTransactions(any(), eq(accountId), eq(TransactionPeriod.ONE_MONTH),
                eq(TransactionFlowFilter.ALL), isNull(), isNull(), isNull(), eq(Sort.Direction.DESC), any());
    }

    @Test
    @DisplayName("거래내역 조회 직접 입력 기간을 서비스로 전달한다")
    void findTransactionsWithCustomPeriod() throws Exception {
        Long userId = 1L;
        Long accountId = 2001L;
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                new SessionUserPrincipal(userId),
                null,
                AuthorityUtils.NO_AUTHORITIES
        );

        when(bankingService.findTransactions(any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new BankingTransactionsResponse(
                        accountId,
                        TransactionPeriod.CUSTOM,
                        TransactionFlowFilter.WITHDRAWAL,
                        List.of(),
                        1,
                        20,
                        false
                ));

        mockMvc.perform(get("/banking/{accountId}/transactions", accountId)
                        .with(authentication(authToken))
                        .param("period", "CUSTOM")
                        .param("flow", "WITHDRAWAL")
                        .param("from", "2026-05-10")
                        .param("to", "2026-06-02")
                        .param("page", "1")
                        .param("size", "20")
                        .param("keyword", "rent")
                        .param("sortDirection", "ASC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.period").value("CUSTOM"))
                .andExpect(jsonPath("$.data.flow").value("WITHDRAWAL"));

        verify(bankingService).findTransactions(any(), eq(accountId), eq(TransactionPeriod.CUSTOM),
                eq(TransactionFlowFilter.WITHDRAWAL), eq(java.time.LocalDate.of(2026, 5, 10)),
                eq(java.time.LocalDate.of(2026, 6, 2)), eq("rent"), eq(Sort.Direction.ASC), any());
    }
}
