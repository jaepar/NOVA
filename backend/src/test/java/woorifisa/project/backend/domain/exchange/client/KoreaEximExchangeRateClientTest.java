package woorifisa.project.backend.domain.exchange.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.EXCHANGE_RATE_COMMUNICATION_FAILED;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import woorifisa.project.backend.domain.exchange.client.response.KoreaEximExchangeRateItem;
import woorifisa.project.backend.global.exception.CustomException;

class KoreaEximExchangeRateClientTest {

    @Test
    @DisplayName("수출입은행 환율 조회에 성공하면 응답 목록을 반환한다")
    void getExchangeRatesSuccess() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        KoreaEximExchangeRateClient client = new KoreaEximExchangeRateClient(builder);
        ReflectionTestUtils.setField(client, "baseUrl", "https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON");
        ReflectionTestUtils.setField(client, "authKey", "test-auth-key");

        server.expect(requestTo("https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=test-auth-key&searchdate=20260613&data=AP01"))
                .andExpect(method(GET))
                .andRespond(withSuccess("""
                        [
                          {
                            "RESULT": 1,
                            "CUR_UNIT": "USD",
                            "CUR_NM": "미국 달러",
                            "TTB": "1,350.20",
                            "TTS": "1,377.46",
                            "DEAL_BAS_R": "1,363.83"
                          }
                        ]
                        """, MediaType.APPLICATION_JSON));

        List<KoreaEximExchangeRateItem> response = client.getExchangeRates("20260613");

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().curUnit()).isEqualTo("USD");
        assertThat(response.getFirst().dealBaseRate()).isEqualTo("1,363.83");
        server.verify();
    }

    @Test
    @DisplayName("수출입은행 환율 조회 중 통신 오류가 발생하면 예외를 던진다")
    void getExchangeRatesCommunicationFailure() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        KoreaEximExchangeRateClient client = new KoreaEximExchangeRateClient(builder);
        ReflectionTestUtils.setField(client, "baseUrl", "https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON");
        ReflectionTestUtils.setField(client, "authKey", "test-auth-key");

        server.expect(requestTo("https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=test-auth-key&searchdate=20260613&data=AP01"))
                .andExpect(method(GET))
                .andRespond(withServerError());

        assertThatThrownBy(() -> client.getExchangeRates("20260613"))
                .isInstanceOfSatisfying(CustomException.class, exception ->
                        assertThat(exception.getExceptionStatus()).isEqualTo(EXCHANGE_RATE_COMMUNICATION_FAILED));
        server.verify();
    }
}
