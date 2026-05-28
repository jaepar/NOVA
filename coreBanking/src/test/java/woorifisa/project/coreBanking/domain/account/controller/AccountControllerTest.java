package woorifisa.project.coreBanking.domain.account.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import woorifisa.project.coreBanking.domain.account.dto.request.RecipientLookupRequest;
import woorifisa.project.coreBanking.domain.account.dto.response.RecipientLookupResponse;
import woorifisa.project.coreBanking.domain.account.service.AccountService;
import woorifisa.project.coreBanking.global.exception.handler.GlobalControllerAdvice;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AccountControllerTest {

    private final AccountService accountService = mock(AccountService.class);
    private final AccountController accountController = new AccountController(accountService);
    private final MockMvc mockMvc = MockMvcBuilders.standaloneSetup(accountController)
            .setControllerAdvice(new GlobalControllerAdvice())
            .build();

    @Test
    @DisplayName("수취인 조회 요청을 서비스로 전달하고 수취인명을 반환한다")
    void lookupRecipientSuccess() throws Exception {
        when(accountService.lookupRecipient(any(RecipientLookupRequest.class)))
                .thenReturn(RecipientLookupResponse.of("백민정"));

        mockMvc.perform(post("/accounts/recipients/lookup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "bankCode": "BUSAN",
                                  "accountNumber": "1122261925003"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("20000"))
                .andExpect(jsonPath("$.data.recipientName").value("백민정"));

        verify(accountService).lookupRecipient(any(RecipientLookupRequest.class));
    }
}
