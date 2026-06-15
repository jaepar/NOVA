package woorifisa.project.backend.domain.exchange.dto.response;

import java.math.BigDecimal;

public record ExchangeRateItemResponse(
        String countryId,
        String currencyCode,
        String currencyName,
        BigDecimal rate,
        BigDecimal previousRate,
        BigDecimal changeRate,
        BigDecimal changePercent,
        String changeDirection
) {
    public static ExchangeRateItemResponse from(
            String countryId,
            String currencyCode,
            String currencyName,
            BigDecimal rate,
            BigDecimal previousRate,
            BigDecimal changeRate,
            BigDecimal changePercent
    ) {
        return new ExchangeRateItemResponse(
                countryId,
                currencyCode,
                currencyName,
                rate,
                previousRate,
                changeRate,
                changePercent,
                resolveDirection(changeRate)
        );
    }

    private static String resolveDirection(BigDecimal changeRate) {
        int comparison = changeRate.compareTo(BigDecimal.ZERO);
        if (comparison > 0) {
            return "UP";
        }
        if (comparison < 0) {
            return "DOWN";
        }
        return "FLAT";
    }
}
