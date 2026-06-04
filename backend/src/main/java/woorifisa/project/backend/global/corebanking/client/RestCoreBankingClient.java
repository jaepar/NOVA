package woorifisa.project.backend.global.corebanking.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingCreateCustomerRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingPasswordVerifyRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingRecipientLookupRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingTransactionQuery;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingTransferRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingRecipientLookupResponse;
import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingRequestLookupResponse;
import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingTransactionsResponse;
import woorifisa.project.backend.domain.wallet.dto.corebanking.request.CoreBankingWalletDebitRequest;
import woorifisa.project.backend.domain.wallet.dto.corebanking.response.CoreBankingBaseResponse;
import woorifisa.project.backend.domain.wallet.dto.corebanking.response.CoreBankingWalletDebitLookupResponse;
import woorifisa.project.backend.global.exception.CustomException;
import woorifisa.project.backend.global.response.BaseResponse;
import woorifisa.project.backend.global.response.status.ResponseStatus;

import java.util.Optional;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_CORE_BANKING_COMMUNICATION_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_RECIPIENT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_DEBIT_COMMUNICATION_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_DEBIT_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_INSUFFICIENT_BALANCE;

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
            if (!response.getSuccess()) {
                throw new CustomException(toResponseStatus(response.getCode(), response.getMessage()));
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
            if (!response.getSuccess()) {
                throw new CustomException(toResponseStatus(response.getCode(), response.getMessage()));
            }
            if (response.getData() == null || response.getData().recipientName() == null || response.getData().recipientName().isBlank()) {
                throw new CustomException(BANKING_RECIPIENT_NOT_FOUND);
            }
            return response.getData();
        } catch (RestClientException exception) {
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
            if (!response.getSuccess()) {
                throw new CustomException(toResponseStatus(response.getCode(), response.getMessage()));
            }
        } catch (RestClientException exception) {
            throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
        }
    }

    @Override
    // Cloud에서 검증한 조회 조건을 Core Banking 거래내역 조회 API의 query parameter로 전달한다.
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

            if (response == null) {
                throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
            }
            if (!response.getSuccess()) {
                throw new CustomException(toResponseStatus(response.getCode(), response.getMessage()));
            }
            if (response.getData() == null) {
                throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
            }
            return response.getData();
        } catch (RestClientException exception) {
            throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
        }
    }

    @Override
    public void debitWalletAccount(CoreBankingWalletDebitRequest request) {
        try {
            CoreBankingBaseResponse<Void> response = restClientBuilder
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
            if (!response.success()) {
                throw new CustomException(isInsufficientBalance(response.code())
                        ? WALLET_INSUFFICIENT_BALANCE
                        : WALLET_DEBIT_FAILED);
            }
        } catch (RestClientException exception) {
            throw new CustomException(WALLET_DEBIT_COMMUNICATION_FAILED);
        }
    }

    @Override
    public boolean existsWalletDebitRequest(String externalRequestId) {
        try {
            CoreBankingBaseResponse<CoreBankingWalletDebitLookupResponse> response = restClientBuilder
                    .baseUrl(coreBankingBaseUrl)
                    .build()
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
            if (!response.getSuccess()) {
                log.error("[core_banking_customer:create_failed] reason=unsuccessful_response userId={}, code={}, message={}",
                        request.userId(), response.getCode(), response.getMessage());
                throw new CustomException(toResponseStatus(response.getCode(), response.getMessage()));
            }
            log.info("[core_banking_customer:create_completed] userId={}", request.userId());
        } catch (RestClientException exception) {
            log.error("[core_banking_customer:create_failed] reason=rest_client_exception userId={}, message={}",
                    request.userId(), exception.getMessage(), exception);
            throw new CustomException(BANKING_CORE_BANKING_COMMUNICATION_FAILED);
        }
    }

    private boolean isInsufficientBalance(String code) {
        return "WALLET_ACCOUNT_DEBIT-003".equals(code);
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
