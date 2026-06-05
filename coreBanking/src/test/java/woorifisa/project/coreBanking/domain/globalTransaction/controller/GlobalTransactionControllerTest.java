package woorifisa.project.coreBanking.domain.globalTransaction.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import woorifisa.project.coreBanking.domain.globalTransaction.dto.request.CreateGlobalTransactionRequest;
import woorifisa.project.coreBanking.domain.globalTransaction.dto.response.CreateGlobalTransactionResponse;
import woorifisa.project.coreBanking.domain.globalTransaction.dto.response.GlobalTransactionListItemResponse;
import woorifisa.project.coreBanking.domain.globalTransaction.dto.response.GlobalTransactionStatusResponse;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionFailureReason;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionStatus;
import woorifisa.project.coreBanking.domain.globalTransaction.service.GlobalTransactionService;
import woorifisa.project.coreBanking.global.exception.handler.GlobalControllerAdvice;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalTransactionControllerTest {

    private final GlobalTransactionService globalTransactionService = mock(GlobalTransactionService.class);
    private final GlobalTransactionController globalTransactionController =
            new GlobalTransactionController(globalTransactionService);
    private final MockMvc mockMvc = MockMvcBuilders.standaloneSetup(globalTransactionController)
            .setControllerAdvice(new GlobalControllerAdvice())
            .build();

    @Test
    @DisplayName("해외송금 요청을 생성하고 PENDING 상태를 반환한다")
    void create() throws Exception {
        when(globalTransactionService.create(org.mockito.ArgumentMatchers.any(CreateGlobalTransactionRequest.class)))
                .thenReturn(new CreateGlobalTransactionResponse(1L, GlobalTransactionStatus.PENDING));

        mockMvc.perform(post("/global-transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("20000"))
                .andExpect(jsonPath("$.data.globalTransactionId").value(1))
                .andExpect(jsonPath("$.data.status").value("PENDING"));

        ArgumentCaptor<CreateGlobalTransactionRequest> captor = forClass(CreateGlobalTransactionRequest.class);
        verify(globalTransactionService).create(captor.capture());
        assertThat(captor.getValue().externalRequestId()).isEqualTo("global-remittance-1");
    }

    @Test
    @DisplayName("해외송금 단건 상태를 조회한다")
    void findStatus() throws Exception {
        when(globalTransactionService.findStatus(1L))
                .thenReturn(new GlobalTransactionStatusResponse(
                        1L,
                        GlobalTransactionStatus.FAILED,
                        GlobalTransactionFailureReason.FDS_RISK_DETECTED
                ));

        mockMvc.perform(get("/global-transactions/{globalTransactionId}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.globalTransactionId").value(1))
                .andExpect(jsonPath("$.data.status").value("FAILED"))
                .andExpect(jsonPath("$.data.failureReason").value("FDS_RISK_DETECTED"));
    }

    @Test
    @DisplayName("고객별 해외송금 목록을 조회한다")
    void findAllByCustomer() throws Exception {
        when(globalTransactionService.findAllByCustomer(1001L))
                .thenReturn(List.of(new GlobalTransactionListItemResponse(
                        1L,
                        "JOHN SMITH",
                        "1000.00",
                        "USD",
                        GlobalTransactionStatus.PENDING,
                        "2026-06-02T10:30:00"
                )));

        mockMvc.perform(get("/global-transactions")
                        .param("customerId", "1001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].globalTransactionId").value(1))
                .andExpect(jsonPath("$.data[0].receiverEngName").value("JOHN SMITH"))
                .andExpect(jsonPath("$.data[0].remitAmount").value("1000.00"))
                .andExpect(jsonPath("$.data[0].currency").value("USD"))
                .andExpect(jsonPath("$.data[0].status").value("PENDING"))
                .andExpect(jsonPath("$.data[0].createdAt").value("2026-06-02T10:30:00"));
    }

    private String requestJson() {
        return """
                {
                  "externalRequestId": "global-remittance-1",
                  "customerId": 1001,
                  "accountId": 2001,
                  "remitPurpose": "생활비 송금",
                  "targetCountry": "US",
                  "currency": "USD",
                  "remitAmount": "1000.00",
                  "mediaryFeePayer": "SENDER",
                  "exchangeRate": 1380.500000,
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
                  "receiverPhone": "+12125550100",
                  "swiftCode": "BOFAUS3N",
                  "receiverAccountNum": "1234567890",
                  "routingNumber": "026009593",
                  "bankName": "Bank of America",
                  "remitReason": "LIVING_EXPENSE"
                }
                """;
    }
}
