package woorifisa.project.coreBanking.domain.accountTransaction.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.DebitWalletAccountRequest;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.TransferAccountRequest;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.UpdateTransactionMemoRequest;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.response.UpdateTransactionMemoResponse;
import woorifisa.project.coreBanking.domain.accountTransaction.service.AccountTransactionService;
import woorifisa.project.coreBanking.global.exception.CustomException;
import woorifisa.project.coreBanking.global.exception.handler.GlobalControllerAdvice;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.WALLET_ACCOUNT_DEBIT_INVALID_REQUEST;

import woorifisa.project.coreBanking.domain.accountTransaction.dto.response.AccountTransactionRequestLookupResponse;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.ACCOUNT_TRANSACTION_NOT_FOUND;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.ACCOUNT_TRANSFER_INVALID_REQUEST;

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
        when(accountTransactionService.findRequestResult(externalRequestId))
                .thenReturn(AccountTransactionRequestLookupResponse.of(externalRequestId));

        mockMvc.perform(get("/account-transactions/requests/{externalRequestId}", externalRequestId))
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

        mockMvc.perform(get("/account-transactions/requests/{externalRequestId}", externalRequestId))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("ACCOUNT_TRANSACTION-001"))
                .andExpect(jsonPath("$.message").value("거래 처리 내역을 찾을 수 없습니다."))
                .andExpect(jsonPath("$.data").isEmpty());
    }

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
        assertThat(request.chargeAmount()).isEqualTo(10000);
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

    @Test
    @DisplayName("계좌 이체 요청을 서비스로 전달하고 공통 성공 응답을 반환한다")
    void transferSuccess() throws Exception {
        mockMvc.perform(post("/account-transactions/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "externalRequestId": "REQ-20260526-0001",
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
                .andExpect(jsonPath("$.message").value("요청에 성공했습니다."))
                .andExpect(jsonPath("$.data").doesNotExist());

        ArgumentCaptor<TransferAccountRequest> requestCaptor = forClass(TransferAccountRequest.class);
        verify(accountTransactionService).transfer(requestCaptor.capture());
        TransferAccountRequest request = requestCaptor.getValue();
        assertThat(request.externalRequestId()).isEqualTo("REQ-20260526-0001");
        assertThat(request.withdrawAccountId()).isEqualTo(2001L);
    }

    @Test
    @DisplayName("계좌 이체 실패 예외를 공통 예외 응답으로 반환한다")
    void transferFail() throws Exception {
        doThrow(new CustomException(ACCOUNT_TRANSFER_INVALID_REQUEST))
                .when(accountTransactionService)
                .transfer(any(TransferAccountRequest.class));

        mockMvc.perform(post("/account-transactions/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "externalRequestId": "REQ-20260526-0001",
                                  "withdrawAccountId": 2001,
                                  "depositAccountId": 2002,
                                  "transferAmount": 5000,
                                  "withdrawMemo": "박재하",
                                  "depositMemo": "박재하"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("ACCOUNT_TRANSFER-001"))
                .andExpect(jsonPath("$.message").value("계좌 이체 요청이 올바르지 않습니다."));
    }

    @Test
    @DisplayName("거래내역 메모 수정 요청을 처리하고 수정된 메모를 반환한다")
    void updateMemoSuccess() throws Exception {
        Long accountId = 2001L;
        Long transactionId = 9001L;
        when(accountTransactionService.updateMemo(any(), any(), any()))
                .thenReturn(new UpdateTransactionMemoResponse("월세"));

        mockMvc.perform(patch("/account-transactions/accounts/{accountId}/transactions/{transactionId}/memo", accountId, transactionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "memo": "월세"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("20000"))
                .andExpect(jsonPath("$.data.memo").value("월세"));

        ArgumentCaptor<UpdateTransactionMemoRequest> requestCaptor = forClass(UpdateTransactionMemoRequest.class);
        verify(accountTransactionService).updateMemo(eq(accountId), eq(transactionId), requestCaptor.capture());
        assertThat(requestCaptor.getValue().memo()).isEqualTo("월세");
    }

}
