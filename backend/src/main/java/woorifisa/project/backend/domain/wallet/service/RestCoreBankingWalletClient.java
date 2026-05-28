package woorifisa.project.backend.domain.wallet.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import woorifisa.project.backend.domain.wallet.dto.corebanking.request.CoreBankingWalletDebitRequest;
import woorifisa.project.backend.domain.wallet.dto.corebanking.response.CoreBankingBaseResponse;
import woorifisa.project.backend.domain.wallet.dto.corebanking.response.CoreBankingWalletDebitLookupResponse;
import woorifisa.project.backend.global.exception.CustomException;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_DEBIT_COMMUNICATION_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_DEBIT_FAILED;

@Component
public class RestCoreBankingWalletClient implements CoreBankingWalletClient {

    private final RestClient restClient;

    public RestCoreBankingWalletClient(
            RestClient.Builder restClientBuilder,
            @Value("${app.core-banking.base-url}") String coreBankingBaseUrl
    ) {
        this.restClient = restClientBuilder.baseUrl(coreBankingBaseUrl).build();
    }

    @Override
    public void debitWalletAccount(CoreBankingWalletDebitRequest request) {
        try {
            CoreBankingBaseResponse<Void> response = restClient
                    .post()
                    .uri("/account-transactions/wallet")
                    .body(request)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            if (response == null) {
                throw new CustomException(WALLET_DEBIT_COMMUNICATION_FAILED);
            }
            if (!response.success()) {
                throw new CustomException(WALLET_DEBIT_FAILED);
            }
        } catch (RestClientException exception) {
            throw new CustomException(WALLET_DEBIT_COMMUNICATION_FAILED);
        }
    }

    @Override
    public boolean existsWalletDebitRequest(String externalRequestId) {
        try {
            CoreBankingBaseResponse<CoreBankingWalletDebitLookupResponse> response = restClient
                    .get()
                    .uri("/account-transactions/requests/{externalRequestId}", externalRequestId)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            return response != null
                    && response.success()
                    && response.data() != null
                    && externalRequestId.equals(response.data().externalRequestId());
        } catch (RestClientException exception) {
            return false;
        }
    }
}
