package woorifisa.project.backend.domain.wallet.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import woorifisa.project.backend.domain.wallet.dto.request.DebitWalletAccountRequest;
import woorifisa.project.backend.domain.wallet.dto.response.WalletDebitResponse;
import woorifisa.project.backend.domain.wallet.dto.response.WalletDebitLookupResponse;

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

    public WalletDebitResponse debitWalletAccount(DebitWalletAccountRequest request) {
        return restClient.post()
                .uri("/account-transactions/wallet")
                .body(request)
                .retrieve()
                .body(WalletDebitResponse.class);
    }

    public WalletDebitLookupResponse findWalletDebitResult(String externalRequestId) {
        return restClient.get()
                .uri("/account-transactions/requests/{externalRequestId}", externalRequestId)
                .retrieve()
                .body(WalletDebitLookupResponse.class);
    }
}
