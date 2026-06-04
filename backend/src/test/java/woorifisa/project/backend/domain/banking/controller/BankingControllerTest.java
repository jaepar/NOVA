package woorifisa.project.backend.domain.banking.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

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

import woorifisa.project.backend.domain.banking.dto.request.UpdateTransactionMemoRequest;
import woorifisa.project.backend.domain.banking.dto.response.AccountHomeResponse;
import woorifisa.project.backend.domain.banking.service.BankingService;
import woorifisa.project.backend.domain.user.entity.enums.CertificateStatus;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.exception.CustomException;

@WebMvcTest(BankingController.class)
class BankingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BankingService bankingService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @DisplayName("홈 계좌 조회 요청을 처리하고 계좌 카드 정보를 반환한다")
    void findHomeAccountSuccess() throws Exception {
        Long userId = 1L;
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                new SessionUserPrincipal(userId),
                null,
                AuthorityUtils.NO_AUTHORITIES
        );

        when(bankingService.findHomeAccount(any()))
                .thenReturn(new AccountHomeResponse(
                        2001L,
                        "NOVA 임시 제한 계좌",
                        "1002867390781",
                        "우리은행",
                        50000,
                        true,
                        CertificateStatus.ISSUED
                ));

        mockMvc.perform(get("/banking/home")
                        .with(authentication(authToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("20000"))
                .andExpect(jsonPath("$.data.accountId").value(2001))
                .andExpect(jsonPath("$.data.accountName").value("NOVA 임시 제한 계좌"))
                .andExpect(jsonPath("$.data.accountNumber").value("1002867390781"))
                .andExpect(jsonPath("$.data.bankName").value("우리은행"))
                .andExpect(jsonPath("$.data.balance").value(50000))
                .andExpect(jsonPath("$.data.hasLimit").value(true))
                .andExpect(jsonPath("$.data.certificateStatus").value("ISSUED"));
    }

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
                                  "accountPassword": "1234",
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
                                50_000,
                                300_000,
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
                .andExpect(jsonPath("$.data.myAccount.balance").value(50000))
                .andExpect(jsonPath("$.data.myAccount.transferLimit").value(300000))
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
    @DisplayName("거래내역 메모 수정 요청을 처리하고 null data를 반환한다")
    void updateTransactionMemoSuccess() throws Exception {
        Long userId = 1L;
        Long transactionId = 9001L;
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                new SessionUserPrincipal(userId),
                null,
                AuthorityUtils.NO_AUTHORITIES
        );

        doNothing().when(bankingService).updateTransactionMemo(any(), any());

        mockMvc.perform(patch("/banking/transactions/{transactionId}/memo", transactionId)
                        .with(authentication(authToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "memo": "월세"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("20000"))
                .andExpect(jsonPath("$.data").doesNotExist());

        verify(bankingService).updateTransactionMemo(eq(transactionId), any(UpdateTransactionMemoRequest.class));
    }

    @Test
    @DisplayName("거래내역 메모가 20자를 초과하면 400 응답을 반환한다")
    void updateTransactionMemoTooLong() throws Exception {
        Long userId = 1L;
        Long transactionId = 9001L;
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                new SessionUserPrincipal(userId),
                null,
                AuthorityUtils.NO_AUTHORITIES
        );

        doThrow(new CustomException(BANKING_TRANSACTION_MEMO_TOO_LONG))
                .when(bankingService).updateTransactionMemo(eq(transactionId), any());

        mockMvc.perform(patch("/banking/transactions/{transactionId}/memo", transactionId)
                        .with(authentication(authToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "memo": "123456789012345678901"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("BANK-009"))
                .andExpect(jsonPath("$.message").value("메모는 20자 이내로 입력해야 합니다."));
    }
}
