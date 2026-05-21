package woorifisa.project.backend.domain.wallet.client;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import woorifisa.project.backend.domain.wallet.dto.request.DebitWalletAccountRequest;
import woorifisa.project.backend.domain.wallet.dto.response.DebitWalletAccountResponse;
import woorifisa.project.backend.global.exception.CustomException;

import java.net.SocketTimeoutException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withException;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_DEBIT_FAILED;

class OnPremWalletClientTest {

    @Test
    void postsDebitRequestToOnPremWalletDebitApi() {
        RestClient.Builder builder = RestClient.builder().baseUrl("http://onprem.test");
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OnPremWalletClient client = new OnPremWalletClient(builder.build());
        DebitWalletAccountRequest request = new DebitWalletAccountRequest(
                "WCR-20260514-0001",
                1001L,
                2001L,
                10000L
        );

        server.expect(requestTo("http://onprem.test/wallet/charges/debit"))
                .andExpect(method(POST))
                .andRespond(withSuccess("""
                        {
                          "success": true,
                          "code": 20000,
                          "message": "계좌 차감이 완료되었습니다."
                        }
                        """, MediaType.APPLICATION_JSON));

        DebitWalletAccountResponse response = client.debitWalletAccount(request);

        assertThat(response.success()).isTrue();
        assertThat(response.code()).isEqualTo(20000);
        assertThat(response.message()).isEqualTo("계좌 차감이 완료되었습니다.");
        server.verify();
    }

    @Test
    void convertsNetworkFailureToWalletDebitFailure() {
        RestClient.Builder builder = RestClient.builder().baseUrl("http://onprem.test");
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OnPremWalletClient client = new OnPremWalletClient(builder.build());
        DebitWalletAccountRequest request = new DebitWalletAccountRequest(
                "WCR-20260514-0001",
                1001L,
                2001L,
                10000L
        );

        server.expect(requestTo("http://onprem.test/wallet/charges/debit"))
                .andExpect(method(POST))
                .andRespond(withException(new SocketTimeoutException("timeout")));

        assertThatThrownBy(() -> client.debitWalletAccount(request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_DEBIT_FAILED));

        server.verify();
    }
}
