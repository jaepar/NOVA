package woorifisa.project.backend.domain.wallet.client;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import woorifisa.project.backend.domain.wallet.dto.request.DebitWalletAccountRequest;
import woorifisa.project.backend.domain.wallet.dto.response.WalletDebitLookupResponse;
import woorifisa.project.backend.domain.wallet.dto.response.WalletDebitResponse;

import java.net.SocketTimeoutException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withException;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class OnPremWalletClientTest {

    @Test
    @DisplayName("On-Prem 월렛 계좌 차감 API를 호출한다")
    void debit() {
        RestClient.Builder builder = RestClient.builder().baseUrl("http://onprem.test");
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OnPremWalletClient client = new OnPremWalletClient(builder.build());
        DebitWalletAccountRequest request = new DebitWalletAccountRequest(
                "WCR-20260514-0001",
                1001L,
                2001L,
                10000
        );

        server.expect(requestTo("http://onprem.test/account-transactions/wallet"))
                .andExpect(method(POST))
                .andRespond(withSuccess("""
                        {
                          "success": true,
                          "code": "20000",
                          "message": "OK"
                        }
                        """, MediaType.APPLICATION_JSON));

        WalletDebitResponse response = client.debitWalletAccount(request);

        assertThat(response.success()).isTrue();
        assertThat(response.code()).isEqualTo("20000");
        assertThat(response.message()).isEqualTo("OK");
        server.verify();
    }

    @Test
    @DisplayName("차감 호출 timeout은 호출자에게 전달한다")
    void timeout() {
        RestClient.Builder builder = RestClient.builder().baseUrl("http://onprem.test");
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OnPremWalletClient client = new OnPremWalletClient(builder.build());
        DebitWalletAccountRequest request = new DebitWalletAccountRequest(
                "WCR-20260514-0001",
                1001L,
                2001L,
                10000
        );

        server.expect(requestTo("http://onprem.test/account-transactions/wallet"))
                .andExpect(method(POST))
                .andRespond(withException(new SocketTimeoutException("timeout")));

        assertThatThrownBy(() -> client.debitWalletAccount(request))
                .isInstanceOf(ResourceAccessException.class);

        server.verify();
    }

    @Test
    @DisplayName("On-Prem 차감 요청 결과 조회 API를 호출한다")
    void lookup() {
        RestClient.Builder builder = RestClient.builder().baseUrl("http://onprem.test");
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OnPremWalletClient client = new OnPremWalletClient(builder.build());

        server.expect(requestTo("http://onprem.test/account-transactions/requests/WCR-20260514-0001"))
                .andExpect(method(GET))
                .andRespond(withSuccess("""
                        {
                          "success": true,
                          "code": "20000",
                          "message": "OK",
                          "data": {
                            "externalRequestId": "WCR-20260514-0001"
                          }
                        }
                        """, MediaType.APPLICATION_JSON));

        WalletDebitLookupResponse response = client.findWalletDebitResult("WCR-20260514-0001");

        assertThat(response.success()).isTrue();
        assertThat(response.code()).isEqualTo("20000");
        assertThat(response.data().externalRequestId()).isEqualTo("WCR-20260514-0001");
        server.verify();
    }
}
