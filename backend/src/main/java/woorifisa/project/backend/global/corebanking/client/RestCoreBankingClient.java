package woorifisa.project.backend.global.corebanking.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import woorifisa.project.backend.global.corebanking.dto.request.*;
import woorifisa.project.backend.global.corebanking.dto.response.*;
import org.springframework.web.client.RestClientResponseException;
import woorifisa.project.backend.domain.banking.dto.request.UpdateTransactionMemoRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingCreateAccountRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingCreateCustomerRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingPasswordVerifyRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingRecipientLookupRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingTransactionQuery;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingTransferRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingWalletDebitRequest;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingBaseErrorResponse;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingCreateAccountResponse;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingRecipientLookupResponse;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingRequestLookupResponse;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingTransactionsResponse;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingWalletDebitLookupResponse;
import woorifisa.project.backend.global.exception.CustomException;
import woorifisa.project.backend.global.response.BaseResponse;
import woorifisa.project.backend.global.response.status.ResponseStatus;

import java.util.Optional;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_CORE_BANKING_COMMUNICATION_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_DEBIT_COMMUNICATION_FAILED;

import java.util.List;

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
    public CoreBankingTransactionsResponse findAccountTransactions(CoreBankingTransactionQuery query) {
        try {
            BaseResponse<CoreBankingTransactionsResponse> response = restClientBuilder
                    .baseUrl(coreBankingBaseUrl)
                    .build()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/account-transactions/accounts/{accountId}")
                            .queryParam("from", query.from())
                            .queryParam("to", query.to())
                            .queryParam("flow", query.flow())
                            // keyword는 선택 조건이라 값이 있을 때만 CoreBanking에 전달한다.
                            .queryParamIfPresent("keyword", Optional.ofNullable(query.keyword()))
                            .queryParam("sortDirection", query.sortDirection())
                            .queryParam("page", query.page())
                            .queryParam("size", query.size())
                            .build(query.accountId()))
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            if (response == null || response.getData() == null) {
                throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
            }
            if (!response.getSuccess()) {
                throw new CustomException(toResponseStatus(response.getCode(), response.getMessage()));
            }
            return response.getData();
        } catch (RestClientException exception) {
            throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
        }
    }

    @Override
    public void updateTransactionMemo(Long transactionId, UpdateTransactionMemoRequest request) {
        try {
            BaseResponse<Void> response = restClientBuilder
                    .baseUrl(coreBankingBaseUrl)
                    .build()
                    .patch()
                    .uri("/account-transactions/transactions/{transactionId}/memo", transactionId)
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
        } catch (RestClientException exception) {
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
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                    })
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
    public CoreBankingCreateGlobalTransactionResponse createGlobalTransaction(CoreBankingCreateGlobalTransactionRequest request) {
        try {
            BaseResponse<CoreBankingCreateGlobalTransactionResponse> response = restClientBuilder
                    .baseUrl(coreBankingBaseUrl)
                    .build()
                    .post()
                    .uri("/global-transactions")
                    .body(request)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            if (response == null) {
                throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
            }
            if (!response.getSuccess()) {
                throw new CustomException(toResponseStatus(response.getCode(), response.getMessage()));
            }
            return response.getData();
        } catch (RestClientException exception) {
            throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
        }
    }

    @Override
    public List<CoreBankingGlobalTransactionListItemResponse> findGlobalTransactionsByCustomerId(Long customerId) {
        try {
            BaseResponse<List<CoreBankingGlobalTransactionListItemResponse>> response = restClientBuilder
                    .baseUrl(coreBankingBaseUrl)
                    .build()
                    .get()
                    .uri("/global-transactions?customerId={customerId}", customerId)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            if (response == null || !response.getSuccess() || response.getData() == null) {
                throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
            }
            return response.getData();
        } catch (RestClientException exception) {
            throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
        }
    }

    @Override
    public CoreBankingCreateAccountResponse createAccount(CoreBankingCreateAccountRequest request) {
        try {
            log.info("[core_banking_account:create_requested] accountType={}, accountName={}, job={}, hasForeignTax={}",
                    request.accountType(), request.accountName(), request.job(), request.hasForeignTax());
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
