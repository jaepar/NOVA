package woorifisa.project.backend.domain.wallet.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import woorifisa.project.backend.domain.wallet.dto.request.DebitWalletAccountRequest;
import woorifisa.project.backend.domain.wallet.dto.response.DebitWalletAccountResponse;
import woorifisa.project.backend.global.exception.CustomException;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_DEBIT_FAILED;

@Component
public class OnPremWalletClient {

    private final RestClient restClient;

    @Autowired
    public OnPremWalletClient(@Value("${app.core-banking.base-url}") String coreBankingBaseUrl) {
        this(RestClient.create(coreBankingBaseUrl));
    }

    OnPremWalletClient(RestClient restClient) {
        this.restClient = restClient;
    }

    public DebitWalletAccountResponse debitWalletAccount(DebitWalletAccountRequest request) {
        try {
            // Cloud 충전 요청 정보를 On-Prem Core Banking 차감 API 전달
            return restClient.post()
                    .uri("/wallet/charges/debit")
                    .body(request)
                    .retrieve()
                    .body(DebitWalletAccountResponse.class);
        } catch (RestClientException e) {
            throw new CustomException(WALLET_DEBIT_FAILED);
        }
    }
}
