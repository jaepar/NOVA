package woorifisa.project.backend.domain.exchange.client;

import java.util.List;

import woorifisa.project.backend.domain.exchange.client.response.KoreaEximExchangeRateItem;

public interface ExchangeRateClient {

    List<KoreaEximExchangeRateItem> getExchangeRates(String searchDate);
}
