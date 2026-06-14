package woorifisa.project.backend.domain.exchange.dto.response;

import java.util.List;

public record ExchangeRatesResponse(
        String requestedDate,
        String effectiveDate,
        String comparisonDate,
        String marketStatus,
        String notice,
        List<ExchangeRateItemResponse> rates
) {
    public static ExchangeRatesResponse of(
            String requestedDate,
            String effectiveDate,
            String comparisonDate,
            String marketStatus,
            String notice,
            List<ExchangeRateItemResponse> rates
    ) {
        return new ExchangeRatesResponse(
                requestedDate,
                effectiveDate,
                comparisonDate,
                marketStatus,
                notice,
                rates
        );
    }
}
