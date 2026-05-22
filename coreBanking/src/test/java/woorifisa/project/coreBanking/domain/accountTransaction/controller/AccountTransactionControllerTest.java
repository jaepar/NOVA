package woorifisa.project.coreBanking.domain.accountTransaction.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.response.AccountTransactionRequestLookupResponse;
import woorifisa.project.coreBanking.domain.accountTransaction.service.AccountTransactionService;
import woorifisa.project.coreBanking.global.exception.CustomException;
import woorifisa.project.coreBanking.global.exception.handler.GlobalControllerAdvice;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.ACCOUNT_TRANSACTION_NOT_FOUND;

class AccountTransactionControllerTest {

    private final AccountTransactionService accountTransactionService = mock(AccountTransactionService.class);
    private final AccountTransactionController accountTransactionController = new AccountTransactionController(accountTransactionService);
    private final MockMvc mockMvc = MockMvcBuilders.standaloneSetup(accountTransactionController)
            .setControllerAdvice(new GlobalControllerAdvice())
            .build();

    @Test
    @DisplayName("거래 처리 내역이 있으면 성공 응답을 반환한다")
    void found() throws Exception {
        String externalRequestId = "TR-20260513-0001";
        AccountTransaction accountTransaction = AccountTransaction.builder()
                .externalRequestId(externalRequestId)
                .build();

        when(accountTransactionService.findRequestResult(externalRequestId))
                .thenReturn(AccountTransactionRequestLookupResponse.from(accountTransaction));

        mockMvc.perform(get("/core-banking/account-transactions/{externalRequestId}", externalRequestId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("20000"))
                .andExpect(jsonPath("$.message").value("요청에 성공했습니다."))
                .andExpect(jsonPath("$.data.externalRequestId").value(externalRequestId));
    }

    @Test
    @DisplayName("거래 처리 내역이 없으면 공통 예외 응답을 반환한다")
    void notFound() throws Exception {
        String externalRequestId = "WCR-20260522-0001";

        when(accountTransactionService.findRequestResult(externalRequestId))
                .thenThrow(new CustomException(ACCOUNT_TRANSACTION_NOT_FOUND));

        mockMvc.perform(get("/core-banking/account-transactions/{externalRequestId}", externalRequestId))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("ACCOUNT_TRANSACTION-001"))
                .andExpect(jsonPath("$.message").value("거래 처리 내역을 찾을 수 없습니다."))
                .andExpect(jsonPath("$.data").isEmpty());
    }
}
