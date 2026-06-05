package woorifisa.project.backend.global.corebanking.client;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingCreateGlobalTransactionRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingCreateGlobalTransactionResponse;
import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingGlobalTransactionListItemResponse;
import woorifisa.project.backend.domain.wallet.dto.corebanking.request.CoreBankingWalletDebitRequest;
import org.springframework.web.client.ResourceAccessException;
import woorifisa.project.backend.domain.banking.dto.request.UpdateTransactionMemoRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingPasswordVerifyRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingWalletDebitRequest;
import woorifisa.project.backend.global.exception.CustomException;

import java.net.SocketTimeoutException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.PATCH;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withBadRequest;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withException;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class RestCoreBankingClientTest {

    private static final String CORE_BANKING_BASE_URL = "http://core-banking.test";

    @Test
    @DisplayName("CoreBanking 해외송금 생성 API를 호출한다")
    void createGlobalTransaction() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        RestCoreBankingClient client = new RestCoreBankingClient(builder);
        CoreBankingCreateGlobalTransactionRequest request = new CoreBankingCreateGlobalTransactionRequest(
                "global-remittance-1",
                1001L,
                2001L,
                "생활비 송금",
                "US",
                "USD",
                "1000.00",
                "SENDER",
                "1380.500000",
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

        setField(client, "coreBankingBaseUrl", "http://core-banking.test");
        server.expect(requestTo("http://core-banking.test/global-transactions"))
                .andExpect(method(POST))
                .andRespond(withSuccess("""
                        {
                          "success": true,
                          "code": "20000",
                          "message": "OK",
                          "data": {
                            "globalTransactionId": 1,
                            "status": "PENDING"
                          }
                        }
                        """, MediaType.APPLICATION_JSON));

        CoreBankingCreateGlobalTransactionResponse response = client.createGlobalTransaction(request);

        assertThat(response.globalTransactionId()).isEqualTo(1L);
        assertThat(response.status()).isEqualTo("PENDING");
        server.verify();
    }

    @Test
    @DisplayName("CoreBanking 고객별 해외송금 목록 조회 API를 호출한다")
    void findGlobalTransactionsByCustomerId() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        RestCoreBankingClient client = new RestCoreBankingClient(builder);

        setField(client, "coreBankingBaseUrl", "http://core-banking.test");
        server.expect(requestTo("http://core-banking.test/global-transactions?customerId=1001"))
                .andExpect(method(GET))
                .andRespond(withSuccess("""
                        {
                          "success": true,
                          "code": "20000",
                          "message": "OK",
                          "data": [
                            {
                              "globalTransactionId": 1,
                              "receiverEngName": "JOHN SMITH",
                              "remitAmount": "1000.00",
                              "currency": "USD",
                              "status": "PENDING",
                              "createdAt": "2026-06-02T10:30:00"
                            }
                          ]
                        }
                        """, MediaType.APPLICATION_JSON));

        List<CoreBankingGlobalTransactionListItemResponse> response =
                client.findGlobalTransactionsByCustomerId(1001L);

        assertThat(response).hasSize(1);
        assertThat(response.get(0).globalTransactionId()).isEqualTo(1L);
        assertThat(response.get(0).receiverEngName()).isEqualTo("JOHN SMITH");
        server.verify();
    }

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

        setField(client, "coreBankingBaseUrl", CORE_BANKING_BASE_URL);
        server.expect(requestTo(CORE_BANKING_BASE_URL + "/account-transactions/wallet"))
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

        setField(client, "coreBankingBaseUrl", CORE_BANKING_BASE_URL);
        server.expect(requestTo(CORE_BANKING_BASE_URL + "/account-transactions/wallet"))
                .andExpect(method(POST))
                .andRespond(withServerError()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("""
                        {
                          "success": false,
                          "code": "40000",
                          "message": "FAIL",
                          "data": null
                        }
                        """));

        assertThatThrownBy(() -> client.debitWalletAccount(request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus().getCode()).isEqualTo("40000"));

        server.verify();
    }

    @Test
    @DisplayName("CoreBanking 차감 호출 timeout은 ResourceAccessException으로 전파한다")
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

        setField(client, "coreBankingBaseUrl", CORE_BANKING_BASE_URL);
        server.expect(requestTo(CORE_BANKING_BASE_URL + "/account-transactions/wallet"))
                .andExpect(method(POST))
                .andRespond(withException(new SocketTimeoutException("timeout")));

        assertThatThrownBy(() -> client.debitWalletAccount(request))
                .isInstanceOf(ResourceAccessException.class);

        server.verify();
    }

    @Test
    @DisplayName("CoreBanking 차감 요청 결과 조회가 성공하면 true를 반환한다")
    void lookup() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        RestCoreBankingClient client = new RestCoreBankingClient(builder);

        setField(client, "coreBankingBaseUrl", CORE_BANKING_BASE_URL);
        server.expect(requestTo(CORE_BANKING_BASE_URL + "/account-transactions/requests/WCR-20260514-0001"))
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

    @Test
    @DisplayName("CoreBanking 거래내역 메모 수정 API를 호출한다")
    void updateTransactionMemo() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        RestCoreBankingClient client = new RestCoreBankingClient(builder);

        setField(client, "coreBankingBaseUrl", "http://core-banking.test");
        server.expect(requestTo("http://core-banking.test/account-transactions/transactions/9001/memo"))
                .andExpect(method(PATCH))
                .andRespond(withSuccess("""
                        {
                          "success": true,
                          "code": "20000",
                          "message": "OK",
                          "data": null
                        }
                        """, MediaType.APPLICATION_JSON));

        client.updateTransactionMemo(
                9001L,
                new UpdateTransactionMemoRequest("월세")
        );

        server.verify();
    }

    @Test
    @DisplayName("CoreBanking 계좌 비밀번호 검증 실패 응답이면 비밀번호 불일치 예외로 변환한다")
    void accountPasswordNotMatched() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        RestCoreBankingClient client = new RestCoreBankingClient(builder);
        CoreBankingPasswordVerifyRequest request = new CoreBankingPasswordVerifyRequest(2001L, "0000");

        setField(client, "coreBankingBaseUrl", CORE_BANKING_BASE_URL);
        server.expect(requestTo(CORE_BANKING_BASE_URL + "/accounts/password/verify"))
                .andExpect(method(POST))
                .andRespond(withBadRequest()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("""
                                {
                                  "success": false,
                                  "code": "ACCOUNT-007",
                                  "message": "account password mismatch",
                                  "data": null
                                }
                                """));

        assertThatThrownBy(() -> client.verifyAccountPassword(request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> {
                            assertThat(exception.getExceptionStatus().getCode()).isEqualTo("ACCOUNT-007");
                            assertThat(exception.getExceptionStatus().getMessage()).isEqualTo("account password mismatch");
                        });

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
