package woorifisa.project.backend.global.corebanking.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import org.springframework.web.client.RestClientResponseException;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingCreateAccountRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingCreateCustomerRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingPasswordVerifyRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingRecipientLookupRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingTransferRequest;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingCreateAccountResponse;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingRecipientLookupResponse;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingRequestLookupResponse;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingWalletDebitRequest;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingBaseResponse;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingWalletDebitLookupResponse;
import woorifisa.project.backend.global.exception.CustomException;
import woorifisa.project.backend.global.response.BaseResponse;
import woorifisa.project.backend.global.response.status.ResponseStatus;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingBaseErrorResponse;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

@Component
@Slf4j
@RequiredArgsConstructor
public class RestCoreBankingClient implements CoreBankingClient {
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
                throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
            }
        } catch (RestClientResponseException exception) {
            CoreBankingBaseErrorResponse<Void> errorResponse = exception.getResponseBodyAs(new ParameterizedTypeReference<>() {
            });

            if (errorResponse != null && errorResponse.code() != null) {
                throw new CustomException(toResponseStatus(errorResponse.code(), errorResponse.message()));
            }
        } catch (RestClientException exception) {
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

    @Override
    public CoreBankingRecipientLookupResponse lookupRecipient(CoreBankingRecipientLookupRequest request) {
        try {
            BaseResponse<CoreBankingRecipientLookupResponse> response = restClientBuilder
                    .baseUrl(coreBankingBaseUrl)
                    .build()
                    .post()
                    .uri("/accounts/recipients/lookup")
                    .body(request)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            if (response == null) {
                throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
            }
            return response.getData();
        } catch (RestClientResponseException exception) {
            CoreBankingBaseErrorResponse<Void> errorResponse = exception.getResponseBodyAs(new ParameterizedTypeReference<>() {
            });

            if (errorResponse != null && errorResponse.code() != null) {
                throw new CustomException(toResponseStatus(errorResponse.code(), errorResponse.message()));
            }
            throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
        }
    }

    @Override
    public void verifyAccountPassword(CoreBankingPasswordVerifyRequest request) {
        try {
            BaseResponse<Void> response = restClientBuilder
                    .baseUrl(coreBankingBaseUrl)
                    .build()
                    .post()
                    .uri("/accounts/password/verify")
                    .body(request)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            if (response == null) {
                throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
            }
        } catch (RestClientResponseException exception) {
            CoreBankingBaseErrorResponse<Void> errorResponse = exception.getResponseBodyAs(new ParameterizedTypeReference<>() {
            });

            if (errorResponse != null && errorResponse.code() != null) {
                throw new CustomException(toResponseStatus(errorResponse.code(), errorResponse.message()));
            }
            throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
        }
    }

    @Override
    public void debitWalletAccount(CoreBankingWalletDebitRequest request) {
        try {
            BaseResponse<Void> response = restClientBuilder
                    .baseUrl(coreBankingBaseUrl)
                    .build()
                    .post()
                    .uri("/account-transactions/wallet")
                    .body(request)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            if (response == null) {
                throw new CustomException(WALLET_DEBIT_COMMUNICATION_FAILED);
            }
        } catch (RestClientResponseException exception) {
            CoreBankingBaseErrorResponse<Void> errorResponse = exception.getResponseBodyAs(new ParameterizedTypeReference<>() {
            });

            if (errorResponse != null && errorResponse.code() != null) {
                throw new CustomException(toResponseStatus(errorResponse.code(), errorResponse.message()));
            }
            throw new CustomException(WALLET_DEBIT_COMMUNICATION_FAILED);
        }
    }

    @Override
    public boolean existsWalletDebitRequest(String externalRequestId) {
        try {
            BaseResponse<CoreBankingWalletDebitLookupResponse> response = restClientBuilder
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

    @Override
    public void createCustomer(CoreBankingCreateCustomerRequest request) {
        try {
            log.info("[core_banking_customer:create_requested] userId={}, name={}, email={}",
                    request.userId(), request.name(), request.email());
            BaseResponse<Void> response = restClientBuilder
                    .baseUrl(coreBankingBaseUrl)
                    .build()
                    .post()
                    .uri("/customers")
                    .body(request)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            if (response == null) {
                log.error("[core_banking_customer:create_failed] reason=null_response userId={}", request.userId());
                throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
            }
        } catch (RestClientResponseException exception) {
            CoreBankingBaseErrorResponse<Void> errorResponse = exception.getResponseBodyAs(new ParameterizedTypeReference<>() {
            });

            if (errorResponse != null && errorResponse.code() != null) {
                throw new CustomException(toResponseStatus(errorResponse.code(), errorResponse.message()));
            }
            log.error("[core_banking_customer:create_failed] reason=rest_client_response_exception userId={}, message={}",
                    request.userId(), exception.getMessage(), exception);
            throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
        }
    }

	@Override
	public CoreBankingCreateAccountResponse createAccount(CoreBankingCreateAccountRequest request) {
		try {
			log.info("[core_banking_account:create_requested] accountType={}, accountName={}, job={}, hasForeignTax={}",
				request.accountType(), request.accountName(), request.job(), request.hasForeignTax());
			// 코어뱅킹 계좌 개설 API 호출 후 응답 본문을 그대로 상위 서비스에 전달한다.
			BaseResponse<CoreBankingCreateAccountResponse> response = restClientBuilder
				.baseUrl(coreBankingBaseUrl)
				.build()
				.post()
				.uri("/accounts/")
				.body(request)
				.retrieve()
				.body(new ParameterizedTypeReference<>() {
				});

			if (response == null) {
				log.error("[core_banking_account:create_failed] reason=null_response");
				throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
			}
			log.info("[core_banking_account:create_completed] accountId={}", response.getData().accountId());
			return response.getData();
		} catch (RestClientResponseException exception) {
            CoreBankingBaseErrorResponse<Void> errorResponse = exception.getResponseBodyAs(new ParameterizedTypeReference<>() {
            });

            if (errorResponse != null && errorResponse.code() != null) {
                throw new CustomException(toResponseStatus(errorResponse.code(), errorResponse.message()));
            }
            throw new CustomException(WALLET_DEBIT_COMMUNICATION_FAILED);
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
