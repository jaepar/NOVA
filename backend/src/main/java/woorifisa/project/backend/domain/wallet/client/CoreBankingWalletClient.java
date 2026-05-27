package woorifisa.project.backend.domain.wallet.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import woorifisa.project.backend.domain.wallet.dto.request.DebitWalletAccountRequest;
import woorifisa.project.backend.domain.wallet.dto.response.WalletDebitLookupResponse;
import woorifisa.project.backend.domain.wallet.dto.response.WalletDebitResponse;

@Component
public class CoreBankingWalletClient {

    private final RestClient restClient;

    @Autowired
    public CoreBankingWalletClient(@Value("${app.core-banking.base-url}") String coreBankingBaseUrl) {
        this.restClient = RestClient.create(coreBankingBaseUrl);
    }

    // 테스트에서 MockRestServiceServer가 연결된 RestClient를 주입하기 위한 생성자다.
    CoreBankingWalletClient(RestClient.Builder restClientBuilder, String coreBankingBaseUrl) {
        this.restClient = restClientBuilder
                .baseUrl(coreBankingBaseUrl)
                .build();
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
