package woorifisa.project.coreBanking.domain.globalTransaction.fds.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import woorifisa.project.coreBanking.domain.globalTransaction.fds.dto.FdsGlobalTransactionScreeningRequest;
import woorifisa.project.coreBanking.domain.globalTransaction.fds.dto.FdsGlobalTransactionScreeningResponse;
import woorifisa.project.coreBanking.global.exception.CustomException;

import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.GLOBAL_TRANSACTION_FDS_COMMUNICATION_FAILED;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.GLOBAL_TRANSACTION_FDS_RESPONSE_INVALID;

@Component
@Slf4j
@RequiredArgsConstructor
public class RestFdsClient implements FdsClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${app.fds.base-url}")
    private String fdsBaseUrl;

    @Override
    public FdsGlobalTransactionScreeningResponse screen(FdsGlobalTransactionScreeningRequest request) {
        log.info("FDS request sending globalTransactionId={} customerId={} accountId={} baseUrl={}",
                request.globalTransactionId(), request.customerId(), request.accountId(), fdsBaseUrl);
        try {
            FdsGlobalTransactionScreeningResponse response = restClientBuilder
                    .baseUrl(fdsBaseUrl)
                    .build()
                    .post()
                    .uri("/fds/global-transactions/screenings")
                    .body(request)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            if (response == null || response.globalTransactionId() == null
                    || !response.globalTransactionId().equals(request.globalTransactionId())
                    || response.status() == null) {
                log.warn("FDS response invalid globalTransactionId={} response={}", request.globalTransactionId(), response);
                throw new CustomException(GLOBAL_TRANSACTION_FDS_RESPONSE_INVALID);
            }
            log.info("FDS response received globalTransactionId={} status={} failureReason={}",
                    response.globalTransactionId(), response.status(), response.failureReason());
            return response;
        } catch (CustomException exception) {
            throw exception;
        } catch (RestClientException exception) {
            log.error("FDS communication error globalTransactionId={} message={}",
                    request.globalTransactionId(), exception.getMessage());
            throw new CustomException(GLOBAL_TRANSACTION_FDS_COMMUNICATION_FAILED);
        }
    }
}
