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
import woorifisa.project.backend.domain.banking.dto.request.UpdateTransactionMemoRequest;
import woorifisa.project.backend.domain.banking.dto.response.AccountCreateResponse;
import woorifisa.project.backend.domain.banking.dto.response.AccountHomeResponse;
import woorifisa.project.backend.domain.banking.dto.response.AccountHomeUiState;
import woorifisa.project.backend.domain.banking.service.BankingService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.exception.CustomException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_TRANSACTION_MEMO_TOO_LONG;

@WebMvcTest(BankingController.class)
class BankingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BankingService bankingService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @DisplayName("home account status returns account summary")
    void findHomeAccountSuccess() throws Exception {
        Long userId = 1L;
        UsernamePasswordAuthenticationToken authToken = authToken(userId);

        when(bankingService.findHomeAccount(any()))
                .thenReturn(new AccountHomeResponse(
                        AccountHomeUiState.HAS_ACCOUNT,
                        new AccountHomeResponse.AccountSummary(
                                2001L,
                                "NOVA account",
                                "1002867390781",
                                "Woori Bank",
                                50000,
                                true
                        )
                ));

        mockMvc.perform(get("/banking/home")
                        .with(authentication(authToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("20000"))
                .andExpect(jsonPath("$.data.hasAccount").doesNotExist())
                .andExpect(jsonPath("$.data.certificateStatus").doesNotExist())
                .andExpect(jsonPath("$.data.uiState").value("HAS_ACCOUNT"))
                .andExpect(jsonPath("$.data.account.accountId").value(2001))
                .andExpect(jsonPath("$.data.account.accountName").value("NOVA account"))
                .andExpect(jsonPath("$.data.account.accountNumber").value("1002867390781"))
                .andExpect(jsonPath("$.data.account.bankName").value("Woori Bank"))
                .andExpect(jsonPath("$.data.account.balance").value(50000))
                .andExpect(jsonPath("$.data.account.hasLimit").value(true));
    }

    @Test
    @DisplayName("session user creates account")
    void createAccountSuccess() throws Exception {
        Long userId = 1L;
        UsernamePasswordAuthenticationToken authToken = authToken(userId);

        when(bankingService.createAccount(any(), any()))
                .thenReturn(AccountCreateResponse.of(2001L, "WOORI", "1002-312-345678"));

        mockMvc.perform(post("/banking")
                        .with(authentication(authToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "accountType": "DEMAND_DEPOSIT",
                                  "accountName": "NOVA demand account",
                                  "customerInfo": {
                                    "address": "Seoul",
                                    "addressDetail": "Dormitory 101"
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
    @DisplayName("session user requests transfer with idempotency key")
    void transferSuccess() throws Exception {
        Long userId = 1L;
        String idempotencyKey = "550e8400-e29b-41d4-a716-446655440000";

        doNothing().when(bankingService).transfer(any(), any(), any());
        UsernamePasswordAuthenticationToken authToken = authToken(userId);

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
                                  "withdrawMemo": "memo",
                                  "depositMemo": "memo"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("20000"))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @DisplayName("transfer preview returns my account and recipient")
    void previewTransferSuccess() throws Exception {
        Long userId = 1L;
        UsernamePasswordAuthenticationToken authToken = authToken(userId);

        when(bankingService.previewTransfer(any(), any()))
                .thenReturn(
                        woorifisa.project.backend.domain.banking.dto.response.TransferPreviewResponse.of(
                                "NOVA account",
                                "1002867390781",
                                50_000,
                                300_000,
                                "Recipient"
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
                .andExpect(jsonPath("$.data.myAccount.accountName").value("NOVA account"))
                .andExpect(jsonPath("$.data.myAccount.accountNumber").value("1002867390781"))
                .andExpect(jsonPath("$.data.myAccount.balance").value(50000))
                .andExpect(jsonPath("$.data.myAccount.transferLimit").value(300000))
                .andExpect(jsonPath("$.data.recipient.recipientName").value("Recipient"));
    }

    @Test
    @DisplayName("account password verify request succeeds")
    void verifyAccountPasswordSuccess() throws Exception {
        Long userId = 1L;
        UsernamePasswordAuthenticationToken authToken = authToken(userId);
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

    private UsernamePasswordAuthenticationToken authToken(Long userId) {
        return new UsernamePasswordAuthenticationToken(
                new SessionUserPrincipal(userId),
                null,
                AuthorityUtils.NO_AUTHORITIES
        );
    }
}
