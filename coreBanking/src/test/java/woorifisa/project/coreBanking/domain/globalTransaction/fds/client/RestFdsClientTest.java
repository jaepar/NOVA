package woorifisa.project.coreBanking.domain.globalTransaction.fds.client;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionFailureReason;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionStatus;
import woorifisa.project.coreBanking.domain.globalTransaction.fds.dto.FdsGlobalTransactionScreeningRequest;
import woorifisa.project.coreBanking.domain.globalTransaction.fds.dto.FdsGlobalTransactionScreeningResponse;
import woorifisa.project.coreBanking.global.exception.CustomException;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.http.HttpMethod.POST;

class RestFdsClientTest {

    @Test
    @DisplayName("FDS 심사 API를 호출하고 SUCCESS 응답을 매핑한다")
    void screenSuccess() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        RestFdsClient client = new RestFdsClient(builder);
        ReflectionTestUtils.setField(client, "fdsBaseUrl", "http://localhost:8001");

        server.expect(requestTo("http://localhost:8001/fds/global-transactions/screenings"))
                .andExpect(method(POST))
                .andRespond(withSuccess("""
                        {
                          "globalTransactionId": 1,
                          "status": "SUCCESS",
                          "failureReason": null,
                          "anomalyScore": -0.1,
                          "threshold": -0.2
                        }
                        """, MediaType.APPLICATION_JSON));

        FdsGlobalTransactionScreeningResponse response = client.screen(request());

        assertThat(response.globalTransactionId()).isEqualTo(1L);
        assertThat(response.status()).isEqualTo(GlobalTransactionStatus.SUCCESS);
        assertThat(response.failureReason()).isNull();
        assertThat(response.anomalyScore()).isEqualTo(-0.1);
        assertThat(response.threshold()).isEqualTo(-0.2);
        server.verify();
    }

    @Test
    @DisplayName("FDS 통신 장애는 CustomException으로 변환한다")
    void screenCommunicationFailed() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        RestFdsClient client = new RestFdsClient(builder);
        ReflectionTestUtils.setField(client, "fdsBaseUrl", "http://localhost:8001");

        server.expect(requestTo("http://localhost:8001/fds/global-transactions/screenings"))
                .andExpect(method(POST))
                .andRespond(withServerError());

        assertThatThrownBy(() -> client.screen(request()))
                .isInstanceOf(CustomException.class);
        server.verify();
    }

    private FdsGlobalTransactionScreeningRequest request() {
        return new FdsGlobalTransactionScreeningRequest(
                1L,
                1001L,
                2001L,
                "생활비 송금",
                "US",
                "USD",
                "1000.00",
                "SENDER",
                new BigDecimal("1380.500000"),
                "1380500",
                "PARK JAEHA",
                "+821012345678",
                "101",
                "Gwangjin-gu",
                "Seoul",
                "05029",
                "KR",
                "JOHN SMITH",
                "Apt 10",
                "Manhattan",
                "New York",
                null,
                "+12125550100",
                "BOFAUS3N",
                "1234567890",
                "026009593",
                "Bank of America",
                "LIVING_EXPENSE"
        );
    }
}
