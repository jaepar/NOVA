package woorifisa.project.backend.domain.exchange.dto.response;

import java.math.BigDecimal;

public record ExchangeRateQuoteResponse(
        String countryId,
        String currencyCode,
        String currencyName,
        String requestedDate,
        String effectiveDate,
        String marketStatus,
        String notice,
        BigDecimal exchangeRate,
        BigDecimal remitAmount,
        BigDecimal krwAmount
) {
    public static ExchangeRateQuoteResponse of(
            String countryId,
            String currencyCode,
            String currencyName,
            String requestedDate,
            String effectiveDate,
            String marketStatus,
            String notice,
            BigDecimal exchangeRate,
            BigDecimal remitAmount,
            BigDecimal krwAmount
    ) {
        return new ExchangeRateQuoteResponse(
                countryId,
                currencyCode,
                currencyName,
                requestedDate,
                effectiveDate,
                marketStatus,
                notice,
                exchangeRate,
                remitAmount,
                krwAmount
        );
    }
}
