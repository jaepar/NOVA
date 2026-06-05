package woorifisa.project.backend.domain.banking.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import woorifisa.project.backend.domain.banking.dto.request.TransactionFlowFilter;
import woorifisa.project.backend.domain.banking.dto.request.TransactionPeriod;
import woorifisa.project.backend.domain.banking.dto.request.UpdateTransactionMemoRequest;
import woorifisa.project.backend.domain.banking.dto.response.AccountCreateResponse;
import woorifisa.project.backend.domain.banking.dto.response.AccountHomeResponse;
import woorifisa.project.backend.domain.banking.dto.response.BankingTransactionsResponse;
import woorifisa.project.backend.domain.banking.dto.response.AccountHomeUiState;
import woorifisa.project.backend.domain.banking.service.BankingService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.exception.CustomException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
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
                        AccountHomeUiState.HAS_ACCOUNT,
                        new AccountHomeResponse.AccountSummary(
                                2001L,
                                "NOVA account",
                                "1002867390781",
                                "Woori Bank",
                                50000,
                                true
                        ),
                        true
                ));

        mockMvc.perform(get("/banking/home")
                        .with(authentication(authToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("20000"))
                .andExpect(jsonPath("$.data.uiState").value("HAS_ACCOUNT"))
                .andExpect(jsonPath("$.data.account.accountId").value(2001))
                .andExpect(jsonPath("$.data.account.accountName").value("NOVA account"))
                .andExpect(jsonPath("$.data.account.accountNumber").value("1002867390781"))
                .andExpect(jsonPath("$.data.account.bankName").value("Woori Bank"))
                .andExpect(jsonPath("$.data.account.balance").value(50000))
                .andExpect(jsonPath("$.data.account.hasLimit").value(true))
                .andExpect(jsonPath("$.data.has_notification").value(true));
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
                                  "withdrawAccountId": "1122261925001",
                                  "depositAccountId": "1122261925002",
                                  "transferAmount": 5000,
                                  "accountPassword": "1234"
                                }
                                """))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.code").value("20000"))
			.andExpect(jsonPath("$.data").doesNotExist());
	}

    @Test
    @DisplayName("이체 사전 조회 요청을 처리한다")
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
                                "홍길동",
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
                .andExpect(jsonPath("$.data.myAccount.userName").value("홍길동"))
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
                .andExpect(status().isOk());
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
                .andExpect(jsonPath("$.data.period").value("ONE_MONTH"))
                .andExpect(jsonPath("$.data.flow").value("ALL"))
                .andExpect(jsonPath("$.data.transactions[0].transactionId").value(9001));

        verify(bankingService).findTransactions(any(), eq(accountId), eq(TransactionPeriod.ONE_MONTH),
                eq(TransactionFlowFilter.ALL), isNull(), isNull(), isNull(), eq(Sort.Direction.DESC), any());
    }

    @Test
    @DisplayName("거래내역 조회 직접 입력 기간과 검색/정렬 조건을 서비스로 전달한다")
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
                .andExpect(jsonPath("$.data.period").value("CUSTOM"));

        verify(bankingService).findTransactions(any(), eq(accountId), eq(TransactionPeriod.CUSTOM),
                eq(TransactionFlowFilter.WITHDRAWAL), eq(LocalDate.of(2026, 5, 10)),
                eq(LocalDate.of(2026, 6, 2)), eq("rent"), eq(Sort.Direction.ASC), any());
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
                .andExpect(jsonPath("$.code").value("BANK-009"));
    }

    @Test
    @DisplayName("세션 사용자와 멱등키 기준으로 해외송금 생성 요청을 처리한다")
    void createGlobalTransactionSuccess() throws Exception {
        Long userId = 1L;
        String idempotencyKey = "global-remittance-1";
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                new SessionUserPrincipal(userId),
                null,
                AuthorityUtils.NO_AUTHORITIES
        );

        when(bankingService.createGlobalTransaction(any(), any(), any()))
                .thenReturn(new woorifisa.project.backend.domain.banking.dto.response.CreateGlobalTransactionResponse(
                        1L,
                        "PENDING"
                ));

        mockMvc.perform(post("/banking/global-transactions")
                        .with(authentication(authToken))
                        .header("Idempotency-Key", idempotencyKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "accountId": 2001,
                                  "remitPurpose": "생활비 송금",
                                  "targetCountry": "US",
                                  "currency": "USD",
                                  "remitAmount": "1000.00",
                                  "mediaryFeePayer": "SENDER",
                                  "exchangeRate": "1380.500000",
                                  "krwAmount": "1380500",
                                  "senderEngName": "PARK JAEHA",
                                  "senderPhone": "+821012345678",
                                  "senderAddressDetail": "101",
                                  "senderDistrict": "Gwangjin-gu",
                                  "senderCity": "Seoul",
                                  "senderZipCode": "05029",
                                  "senderCountry": "KR",
                                  "receiverEngName": "JOHN SMITH",
                                  "receiverAddressDetail": "Apt 10",
                                  "receiverDistrict": "Manhattan",
                                  "receiverCity": "New York",
                                  "receiverPhone": "+12125550100",
                                  "swiftCode": "BOFAUS3N",
                                  "receiverAccountNum": "1234567890",
                                  "routingNumber": "026009593",
                                  "bankName": "Bank of America",
                                  "remitReason": "LIVING_EXPENSE"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("20000"))
                .andExpect(jsonPath("$.data.globalTransactionId").value(1))
                .andExpect(jsonPath("$.data.status").value("PENDING"));

        verify(bankingService).createGlobalTransaction(any(), any(), any());
    }

    @Test
    @DisplayName("세션 사용자 기준 해외송금 목록 조회 요청을 처리한다")
    void findGlobalTransactionsSuccess() throws Exception {
        Long userId = 1L;
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                new SessionUserPrincipal(userId),
                null,
                AuthorityUtils.NO_AUTHORITIES
        );

        when(bankingService.findGlobalTransactions(any()))
                .thenReturn(java.util.List.of(
                        new woorifisa.project.backend.domain.banking.dto.response.GlobalTransactionListItemResponse(
                                1L,
                                "JOHN SMITH",
                                "1000.00",
                                "USD",
                                "PENDING",
                                "2026-06-02T10:30:00"
                        )
                ));

        mockMvc.perform(get("/banking/global-transactions")
                        .with(authentication(authToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("20000"))
                .andExpect(jsonPath("$.data[0].globalTransactionId").value(1))
                .andExpect(jsonPath("$.data[0].receiverEngName").value("JOHN SMITH"))
                .andExpect(jsonPath("$.data[0].status").value("PENDING"));
    }
}
