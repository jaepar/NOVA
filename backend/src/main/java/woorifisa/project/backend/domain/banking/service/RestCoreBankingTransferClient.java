package woorifisa.project.backend.domain.banking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingTransferRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingRequestLookupResponse;
import woorifisa.project.backend.global.exception.CustomException;
import woorifisa.project.backend.global.response.BaseResponse;
import woorifisa.project.backend.global.response.status.ResponseStatus;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_CORE_BANKING_COMMUNICATION_FAILED;

@Component
@RequiredArgsConstructor
public class RestCoreBankingTransferClient implements CoreBankingTransferClient {
    private final RestClient.Builder restClientBuilder;

    @Value("${app.core-banking.base-url}")
    private String coreBankingBaseUrl;

    @Override
    public void transfer(CoreBankingTransferRequest request) {
        try {
            BaseResponse<Void> response = restClientBuilder
                    .baseUrl(coreBankingBaseUrl)
                    .build()
                    .post()
                    .uri("/account-transactions/transfers")
                    .body(request)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            if (response == null) {
                // 통신 장애
                throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
            }
            if (!response.getSuccess()) {
                // 실패 응답 메시지는 코어 뱅킹에서 응답한 메시지 그대로 응답하도록
                throw new CustomException(toResponseStatus(response.getCode(), response.getMessage()));
            }
        } catch (RestClientException exception) {
            // 통신 장애
            throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
        }
    }

    @Override
    public boolean existsTransferRequest(String externalRequestId) {
        try {
            BaseResponse<CoreBankingRequestLookupResponse> response = restClientBuilder
                    .baseUrl(coreBankingBaseUrl)
                    .build()
                    .get()
                    .uri("/account-transactions/requests/{externalRequestId}", externalRequestId)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            return response != null
                    && response.getSuccess()
                    && response.getData() != null
                    && externalRequestId.equals(response.getData().externalRequestId());
        } catch (RestClientException exception) {
            return false;
        }
    }

    private ResponseStatus toResponseStatus(String code, String message) {
        return new ResponseStatus() {
            @Override
            public boolean getSuccess() {
                return false;
            }

            @Override
            public String getCode() {
                return code;
            }

            @Override
            public String getMessage() {
                return message;
            }
        };
    }
}
