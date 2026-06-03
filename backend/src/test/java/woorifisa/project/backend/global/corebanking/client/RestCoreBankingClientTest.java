package woorifisa.project.backend.global.corebanking.client;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import woorifisa.project.backend.domain.wallet.dto.corebanking.request.CoreBankingWalletDebitRequest;
import woorifisa.project.backend.global.exception.CustomException;

import java.net.SocketTimeoutException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withException;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_DEBIT_COMMUNICATION_FAILED;

class RestCoreBankingClientTest {

    @Test
    @DisplayName("CoreBanking 월렛 계좌 차감 API를 호출한다")
    void debit() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        RestCoreBankingClient client = new RestCoreBankingClient(builder);
        CoreBankingWalletDebitRequest request = new CoreBankingWalletDebitRequest(
                "WCR-20260514-0001",
                1001L,
                2001L,
                10000
        );

        setField(client, "coreBankingBaseUrl", "http://core-banking.test");
        server.expect(requestTo("http://core-banking.test/account-transactions/wallet"))
                .andExpect(method(POST))
                .andRespond(withSuccess("""
                        {
                          "success": true,
                          "code": "20000",
                          "message": "OK"
                        }
                        """, MediaType.APPLICATION_JSON));

        client.debitWalletAccount(request);

        server.verify();
    }

    @Test
    @DisplayName("CoreBanking 월렛 계좌 차감 실패 응답이면 도메인 예외를 던진다")
    void debitFailed() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        RestCoreBankingClient client = new RestCoreBankingClient(builder);
        CoreBankingWalletDebitRequest request = new CoreBankingWalletDebitRequest(
                "WCR-20260514-0001",
                1001L,
                2001L,
                10000
        );

        setField(client, "coreBankingBaseUrl", "http://core-banking.test");
        server.expect(requestTo("http://core-banking.test/account-transactions/wallet"))
                .andExpect(method(POST))
                .andRespond(withSuccess("""
                        {
                          "success": false,
                          "code": "40000",
                          "message": "FAIL"
                        }
                        """, MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.debitWalletAccount(request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus().getCode()).isEqualTo("40000"));

        server.verify();
    }

    @Test
    @DisplayName("차감 호출 timeout은 통신 예외로 변환한다")
    void timeout() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        RestCoreBankingClient client = new RestCoreBankingClient(builder);
        CoreBankingWalletDebitRequest request = new CoreBankingWalletDebitRequest(
                "WCR-20260514-0001",
                1001L,
                2001L,
                10000
        );

        setField(client, "coreBankingBaseUrl", "http://core-banking.test");
        server.expect(requestTo("http://core-banking.test/account-transactions/wallet"))
                .andExpect(method(POST))
                .andRespond(withException(new SocketTimeoutException("timeout")));

        assertThatThrownBy(() -> client.debitWalletAccount(request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_DEBIT_COMMUNICATION_FAILED));

        server.verify();
    }

    @Test
    @DisplayName("CoreBanking 차감 요청 결과 조회가 성공하면 true를 반환한다")
    void lookup() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        RestCoreBankingClient client = new RestCoreBankingClient(builder);

        setField(client, "coreBankingBaseUrl", "http://core-banking.test");
        server.expect(requestTo("http://core-banking.test/account-transactions/requests/WCR-20260514-0001"))
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

        assertThat(client.existsWalletDebitRequest("WCR-20260514-0001")).isTrue();

        server.verify();
    }

    private void setField(RestCoreBankingClient client, String fieldName, String fieldValue) {
        try {
            java.lang.reflect.Field field = RestCoreBankingClient.class.getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(client, fieldValue);
        } catch (ReflectiveOperationException exception) {
            throw new RuntimeException(exception);
        }
    }
}
