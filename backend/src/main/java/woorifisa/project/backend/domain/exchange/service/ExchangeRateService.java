package woorifisa.project.backend.domain.exchange.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import woorifisa.project.backend.domain.exchange.client.ExchangeRateClient;
import woorifisa.project.backend.domain.exchange.client.response.KoreaEximExchangeRateItem;
import woorifisa.project.backend.domain.exchange.dto.response.ExchangeRateItemResponse;
import woorifisa.project.backend.domain.exchange.dto.response.ExchangeRateQuoteResponse;
import woorifisa.project.backend.domain.exchange.dto.response.ExchangeRatesResponse;
import woorifisa.project.backend.global.exception.CustomException;

@Service
@Slf4j
@RequiredArgsConstructor
public class ExchangeRateService {

    private static final DateTimeFormatter API_DATE_FORMAT = DateTimeFormatter.BASIC_ISO_DATE;
    private static final DateTimeFormatter RESPONSE_DATE_FORMAT = DateTimeFormatter.ISO_DATE;
    private static final int MAX_LOOKBACK_DAYS = 10;
    private static final LocalTime MARKET_OPEN_TIME = LocalTime.of(11, 0);

    private static final List<ExchangeTarget> HIGHLIGHT_TARGETS = List.of(
            ExchangeTarget.USD,
            ExchangeTarget.JPY,
            ExchangeTarget.EUR
    );

    private static final List<ExchangeTarget> FULL_PAGE_TARGETS = List.of(
            ExchangeTarget.USD,
            ExchangeTarget.JPY,
            ExchangeTarget.EUR,
            ExchangeTarget.CNY,
            ExchangeTarget.VND,
            ExchangeTarget.PHP,
            ExchangeTarget.THB,
            ExchangeTarget.IDR,
            ExchangeTarget.INR,
            ExchangeTarget.UZS,
            ExchangeTarget.MNT
    );

    private final ExchangeRateClient exchangeRateClient;
    private final Clock clock;

    public ExchangeRatesResponse getHighlights() {
        log.info("[exchange_rate:highlights] 대상통화={}건", HIGHLIGHT_TARGETS.size());
        return buildRatesResponse(HIGHLIGHT_TARGETS);
    }

    public ExchangeRatesResponse getExchangeRates() {
        log.info("[exchange_rate:list] 대상통화={}건", FULL_PAGE_TARGETS.size());
        return buildRatesResponse(FULL_PAGE_TARGETS);
    }

    public ExchangeRateQuoteResponse getRemittanceQuote(String countryId, String currencyCode, String amount) {
        LocalDate requestedDate = LocalDate.of(2026, 6, 12); // test LocalDate.now(clock);
        ExchangeTarget target = ExchangeTarget.findByCountryAndCurrency(countryId, currencyCode)
                .orElseThrow(() -> {
                    log.warn("[exchange_rate:unsupported_currency] countryId={} currencyCode={}", countryId, currencyCode);
                    return new CustomException(EXCHANGE_RATE_UNSUPPORTED_CURRENCY);
                });
        ExchangeSnapshot currentSnapshot = findLatestSnapshot(requestedDate);
        BigDecimal normalizedRate = currentSnapshot.findRate(target.providerUnit(), RateType.TTS);
        BigDecimal remitAmount = parseDecimal(amount);
        BigDecimal krwAmount = remitAmount.multiply(normalizedRate).setScale(0, RoundingMode.HALF_UP);

        log.info(
                "[exchange_rate:remittance_quote] countryId={} currencyCode={} requestedDate={} effectiveDate={} amount={} rate={}",
                countryId,
                currencyCode,
                requestedDate,
                currentSnapshot.date(),
                remitAmount,
                normalizedRate
        );

        return ExchangeRateQuoteResponse.of(
                target.countryId(),
                target.currencyCode(),
                target.currencyName(),
                formatDate(requestedDate),
                formatDate(currentSnapshot.date()),
                resolveMarketStatus(requestedDate, currentSnapshot.date()),
                buildNotice(requestedDate, currentSnapshot.date(), true),
                normalizedRate,
                remitAmount,
                krwAmount
        );
    }

    private ExchangeRatesResponse buildRatesResponse(List<ExchangeTarget> targets) {
        // 임시 확인이 끝나면 LocalDate.now(clock)로 되돌리면 됩니다.
        LocalDate requestedDate = LocalDate.of(2026, 6, 12); // test LocalDate.now(clock);
        ExchangeSnapshot currentSnapshot = findLatestSnapshot(requestedDate);
        ExchangeSnapshot comparisonSnapshot = findLatestSnapshot(currentSnapshot.date().minusDays(1));

        log.info(
                "[exchange_rate:build_rates] requestedDate={} effectiveDate={} comparisonDate={} targets={}",
                requestedDate,
                currentSnapshot.date(),
                comparisonSnapshot.date(),
                targets.size()
        );

        List<ExchangeRateItemResponse> rates = targets.stream()
                .flatMap(target -> {
                    Optional<BigDecimal> currentRate = currentSnapshot.findRateSafely(target.providerUnit(), RateType.DEAL_BASE);
                    Optional<BigDecimal> previousRate = comparisonSnapshot.findRateSafely(target.providerUnit(), RateType.DEAL_BASE);

                    if (currentRate.isEmpty() || previousRate.isEmpty()) {
                        log.warn(
                                "[exchange_rate:target_skipped] countryId={} currencyCode={} providerUnit={} currentExists={} previousExists={}",
                                target.countryId(),
                                target.currencyCode(),
                                target.providerUnit(),
                                currentRate.isPresent(),
                                previousRate.isPresent()
                        );
                        return Stream.empty();
                    }

                    BigDecimal changeRate = currentRate.get().subtract(previousRate.get()).setScale(2, RoundingMode.HALF_UP);
                    BigDecimal changePercent = previousRate.get().compareTo(BigDecimal.ZERO) == 0
                            ? BigDecimal.ZERO
                            : changeRate.multiply(BigDecimal.valueOf(100))
                                    .divide(previousRate.get(), 2, RoundingMode.HALF_UP);

                    return Stream.of(ExchangeRateItemResponse.from(
                            target.countryId(),
                            target.currencyCode(),
                            target.currencyName(),
                            currentRate.get(),
                            previousRate.get(),
                            changeRate,
                            changePercent
                    ));
                })
                .toList();

        return ExchangeRatesResponse.of(
                formatDate(requestedDate),
                formatDate(currentSnapshot.date()),
                formatDate(comparisonSnapshot.date()),
                resolveMarketStatus(requestedDate, currentSnapshot.date()),
                buildNotice(requestedDate, currentSnapshot.date(), false),
                rates
        );
    }

    private ExchangeSnapshot findLatestSnapshot(LocalDate targetDate) {
        for (int offset = 0; offset <= MAX_LOOKBACK_DAYS; offset++) {
            LocalDate candidateDate = targetDate.minusDays(offset);
            List<KoreaEximExchangeRateItem> items = exchangeRateClient.getExchangeRates(candidateDate.format(API_DATE_FORMAT));
            Map<String, KoreaEximExchangeRateItem> usableRates = toUsableRates(items);
            if (!usableRates.isEmpty()) {
                if (offset > 0) {
                    log.info(
                            "[exchange_rate:fallback_applied] requestedDate={} effectiveDate={} lookbackDays={}",
                            targetDate,
                            candidateDate,
                            offset
                    );
                }
                return new ExchangeSnapshot(candidateDate, usableRates);
            }

            log.debug("[exchange_rate:no_data] candidateDate={}", candidateDate);
        }

        log.warn("[exchange_rate:unavailable] requestedDate={} maxLookbackDays={}", targetDate, MAX_LOOKBACK_DAYS);
        throw new CustomException(EXCHANGE_RATE_UNAVAILABLE);
    }

    private Map<String, KoreaEximExchangeRateItem> toUsableRates(List<KoreaEximExchangeRateItem> items) {
        Map<String, KoreaEximExchangeRateItem> usableRates = new LinkedHashMap<>();
        for (KoreaEximExchangeRateItem item : items) {
            if (item == null || item.curUnit() == null || item.dealBaseRate() == null || item.dealBaseRate().isBlank()) {
                continue;
            }
            usableRates.put(item.curUnit(), item);
        }
        return usableRates;
    }

    private String resolveMarketStatus(LocalDate requestedDate, LocalDate effectiveDate) {
        // 요청일과 실제 환율 반영일이 다르면 주말/공휴일/장 시작 전 여부를 구분해 안내 문구를 만든다.
        if (requestedDate.equals(effectiveDate)) {
            return "OPEN";
        }

        DayOfWeek dayOfWeek = requestedDate.getDayOfWeek();
        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            return "WEEKEND";
        }

        if (requestedDate.equals(LocalDate.now(clock)) && LocalTime.now(clock).isBefore(MARKET_OPEN_TIME)) {
            return "PRE_OPEN";
        }

        return "HOLIDAY";
    }

    private String buildNotice(LocalDate requestedDate, LocalDate effectiveDate, boolean remittance) {
        String suffix = remittance ? "송금 보내실때 환율입니다." : "기준 환율입니다.";
        String marketStatus = resolveMarketStatus(requestedDate, effectiveDate);

        return switch (marketStatus) {
            case "WEEKEND" -> "주말에는 환율이 고시되지 않아 직전 영업일 기준 값을 보여드려요. " + suffix;
            case "PRE_OPEN" -> "영업일 오전 11시 이전에는 직전 영업일 기준 값을 보여드려요. " + suffix;
            case "HOLIDAY" -> "비영업일에는 직전 영업일 기준 값을 보여드려요. " + suffix;
            default -> suffix;
        };
    }

    private BigDecimal parseDecimal(String value) {
        if (value == null || value.isBlank()) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(value.replace(",", "").trim());
    }

    private String formatDate(LocalDate date) {
        return date.format(RESPONSE_DATE_FORMAT);
    }

    private enum RateType {
        DEAL_BASE,
        TTS
    }

    private record ExchangeSnapshot(
            LocalDate date,
            Map<String, KoreaEximExchangeRateItem> rates
    ) {
        BigDecimal findRate(String providerUnit, RateType rateType) {
            KoreaEximExchangeRateItem item = findRateItem(providerUnit)
                    .orElseThrow(() -> new CustomException(EXCHANGE_RATE_UNAVAILABLE));

            String rawValue = switch (rateType) {
                case DEAL_BASE -> item.dealBaseRate();
                case TTS -> item.tts();
            };

            return normalizeRate(providerUnit, rawValue);
        }

        Optional<BigDecimal> findRateSafely(String providerUnit, RateType rateType) {
            return findRateItem(providerUnit)
                    .map(item -> {
                        String rawValue = switch (rateType) {
                            case DEAL_BASE -> item.dealBaseRate();
                            case TTS -> item.tts();
                        };
                        return normalizeRate(providerUnit, rawValue);
                    });
        }

        private Optional<KoreaEximExchangeRateItem> findRateItem(String providerUnit) {
            Optional<KoreaEximExchangeRateItem> exactMatch = Optional.ofNullable(rates.get(providerUnit));
            if (exactMatch.isPresent()) {
                return exactMatch;
            }

            Optional<KoreaEximExchangeRateItem> normalizedMatch = rates.entrySet().stream()
                    .filter(entry -> normalizeUnit(entry.getKey()).equals(normalizeUnit(providerUnit)))
                    .map(Map.Entry::getValue)
                    .findFirst();

            if (normalizedMatch.isEmpty()) {
                log.warn("[exchange_rate:missing_rate] providerUnit={} availableUnits={}", providerUnit, rates.keySet());
            }
            return normalizedMatch;
        }

        private BigDecimal normalizeRate(String providerUnit, String rawValue) {
            BigDecimal value = new BigDecimal(rawValue.replace(",", "").trim());
            int unitFactor = ExchangeTarget.resolveUnitFactor(providerUnit);
            if (unitFactor <= 1) {
                return value.setScale(2, RoundingMode.HALF_UP);
            }
            return value.divide(BigDecimal.valueOf(unitFactor), 2, RoundingMode.HALF_UP);
        }

        private String normalizeUnit(String providerUnit) {
            String normalized = providerUnit == null
                    ? ""
                    : providerUnit.replaceAll("\\(.*\\)", "").trim().toUpperCase();
            if ("CNH".equals(normalized)) {
                return "CNY";
            }
            return normalized;
        }
    }

    private enum ExchangeTarget {
        USD("us", "USD", "미국 달러", "USD"),
        JPY("jp", "JPY", "일본 엔", "JPY(100)"),
        EUR("eu", "EUR", "유로", "EUR"),
        CNY("cn", "CNY", "중국 위안", "CNY"),
        VND("vn", "VND", "베트남 동", "VND"),
        PHP("ph", "PHP", "필리핀 페소", "PHP"),
        THB("th", "THB", "태국 바트", "THB"),
        IDR("id", "IDR", "인도네시아 루피아", "IDR(100)"),
        INR("in", "INR", "인도 루피", "INR"),
        UZS("uz", "USD", "우즈베키스탄(USD)", "USD"),
        MNT("mn", "MNT", "몽골 투그릭", "MNT");

        private final String countryId;
        private final String currencyCode;
        private final String currencyName;
        private final String providerUnit;

        ExchangeTarget(String countryId, String currencyCode, String currencyName, String providerUnit) {
            this.countryId = countryId;
            this.currencyCode = currencyCode;
            this.currencyName = currencyName;
            this.providerUnit = providerUnit;
        }

        static Optional<ExchangeTarget> findByCountryAndCurrency(String countryId, String currencyCode) {
            return List.of(values()).stream()
                    .filter(target -> target.countryId.equalsIgnoreCase(countryId)
                            && target.currencyCode.equalsIgnoreCase(currencyCode))
                    .findFirst();
        }

        static int resolveUnitFactor(String providerUnit) {
            if (providerUnit == null) {
                return 1;
            }
            int start = providerUnit.indexOf('(');
            int end = providerUnit.indexOf(')');
            if (start < 0 || end <= start + 1) {
                return 1;
            }
            return Integer.parseInt(providerUnit.substring(start + 1, end));
        }

        String countryId() {
            return countryId;
        }

        String currencyCode() {
            return currencyCode;
        }

        String currencyName() {
            return currencyName;
        }

        String providerUnit() {
            return providerUnit;
        }
    }
}
