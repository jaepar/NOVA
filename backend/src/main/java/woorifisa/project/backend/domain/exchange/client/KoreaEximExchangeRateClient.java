package woorifisa.project.backend.domain.exchange.client;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import woorifisa.project.backend.domain.exchange.client.response.KoreaEximExchangeRateItem;
import woorifisa.project.backend.global.exception.CustomException;

@Component
@Slf4j
@RequiredArgsConstructor
public class KoreaEximExchangeRateClient implements ExchangeRateClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${app.exchange-rate.base-url:https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON}")
    private String baseUrl;

    @Value("${app.exchange-rate.auth-key:}")
    private String authKey;

    @Override
    public List<KoreaEximExchangeRateItem> getExchangeRates(String searchDate) {
        try {
            URI requestUri = UriComponentsBuilder.fromUriString(baseUrl)
                    .queryParam("authkey", authKey)
                    .queryParam("searchdate", searchDate)
                    .queryParam("data", "AP01")
                    .build(true)
                    .toUri();

            log.debug("[exchange_rate:fetch] searchDate={} uri={}", searchDate, requestUri);

            List<KoreaEximExchangeRateItem> response = restClientBuilder
                    .build()
                    .get()
                    .uri(requestUri)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            log.debug("[exchange_rate:fetch_success] searchDate={} itemCount={}", searchDate, response == null ? 0 : response.size());
            return response == null ? List.of() : response;
        } catch (RestClientException exception) {
            log.warn("[exchange_rate:fetch_failed] searchDate={} message={}", searchDate, exception.getMessage());
            throw new CustomException(EXCHANGE_RATE_COMMUNICATION_FAILED);
        }
    }
}
