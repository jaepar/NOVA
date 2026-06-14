package woorifisa.project.backend.domain.exchange.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.EXCHANGE_RATE_UNSUPPORTED_CURRENCY;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import woorifisa.project.backend.domain.exchange.client.ExchangeRateClient;
import woorifisa.project.backend.domain.exchange.client.response.KoreaEximExchangeRateItem;
import woorifisa.project.backend.domain.exchange.dto.response.ExchangeRateItemResponse;
import woorifisa.project.backend.domain.exchange.dto.response.ExchangeRateQuoteResponse;
import woorifisa.project.backend.domain.exchange.dto.response.ExchangeRatesResponse;
import woorifisa.project.backend.global.exception.CustomException;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExchangeRateServiceTest {

    @Mock
    private ExchangeRateClient exchangeRateClient;

    @Test
    @DisplayName("주말에는 직전 영업일 환율과 주말 상태를 반환한다")
    void getHighlightsOnWeekend() {
        Clock clock = Clock.fixed(Instant.parse("2026-06-14T03:00:00Z"), ZoneId.of("Asia/Seoul"));
        ExchangeRateService service = new ExchangeRateService(exchangeRateClient, clock);

        when(exchangeRateClient.getExchangeRates("20260614")).thenReturn(List.of());
        when(exchangeRateClient.getExchangeRates("20260613")).thenReturn(List.of(
                item("USD", "미국 달러", "1,350.00", "1,380.00", "1,365.00"),
                item("JPY(100)", "일본 엔", "950.00", "980.00", "965.00"),
                item("EUR", "유로", "1,520.00", "1,550.00", "1,535.00")
        ));
        when(exchangeRateClient.getExchangeRates("20260612")).thenReturn(List.of(
                item("USD", "미국 달러", "1,345.00", "1,375.00", "1,360.00"),
                item("JPY(100)", "일본 엔", "945.00", "975.00", "960.00"),
                item("EUR", "유로", "1,510.00", "1,540.00", "1,525.00")
        ));

        ExchangeRatesResponse response = service.getHighlights();

        assertThat(response.marketStatus()).isEqualTo("WEEKEND");
        assertThat(response.effectiveDate()).isEqualTo("2026-06-13");
        assertThat(response.notice()).contains("주말");
        ExchangeRateItemResponse jpy = response.rates().stream()
                .filter(rate -> rate.currencyCode().equals("JPY"))
                .findFirst()
                .orElseThrow();
        assertThat(jpy.rate()).isEqualByComparingTo("9.65");
        assertThat(jpy.changeRate()).isEqualByComparingTo("0.05");
    }

    @Test
    @DisplayName("해외송금 환율 조회는 송금 보내실때 환율을 사용해 원화 금액을 계산한다")
    void getRemittanceQuoteUsesTtsRate() {
        Clock clock = Clock.fixed(Instant.parse("2026-06-15T03:30:00Z"), ZoneId.of("Asia/Seoul"));
        ExchangeRateService service = new ExchangeRateService(exchangeRateClient, clock);

        when(exchangeRateClient.getExchangeRates("20260615")).thenReturn(List.of(
                item("USD", "미국 달러", "1,350.20", "1,377.46", "1,363.83")
        ));

        ExchangeRateQuoteResponse response = service.getRemittanceQuote("us", "USD", "1000");

        assertThat(response.marketStatus()).isEqualTo("OPEN");
        assertThat(response.exchangeRate()).isEqualByComparingTo("1377.46");
        assertThat(response.krwAmount()).isEqualByComparingTo("1377460");
        assertThat(response.currencyCode()).isEqualTo("USD");
    }

    @Test
    @DisplayName("지원하지 않는 통화 코드로 해외송금 환율을 요청하면 예외를 던진다")
    void getRemittanceQuoteRejectsUnsupportedCurrency() {
        Clock clock = Clock.fixed(Instant.parse("2026-06-15T03:30:00Z"), ZoneId.of("Asia/Seoul"));
        ExchangeRateService service = new ExchangeRateService(exchangeRateClient, clock);

        assertThatThrownBy(() -> service.getRemittanceQuote("us", "AUD", "1000"))
                .isInstanceOfSatisfying(CustomException.class, exception ->
                        assertThat(exception.getExceptionStatus()).isEqualTo(EXCHANGE_RATE_UNSUPPORTED_CURRENCY));
    }

    @Test
    @DisplayName("전체 환율 조회에서 일부 통화가 없으면 해당 통화만 제외하고 응답한다")
    void getExchangeRatesSkipsMissingCurrencies() {
        Clock clock = Clock.fixed(Instant.parse("2026-06-15T03:30:00Z"), ZoneId.of("Asia/Seoul"));
        ExchangeRateService service = new ExchangeRateService(exchangeRateClient, clock);

        when(exchangeRateClient.getExchangeRates("20260612")).thenReturn(List.of(
                item("USD", "미국 달러", "1,350.20", "1,377.46", "1,363.83"),
                item("JPY(100)", "일본 엔", "950.00", "980.00", "965.00"),
                item("EUR", "유로", "1,520.00", "1,550.00", "1,535.00")
        ));
        when(exchangeRateClient.getExchangeRates("20260611")).thenReturn(List.of(
                item("USD", "미국 달러", "1,340.20", "1,367.46", "1,353.83"),
                item("JPY(100)", "일본 엔", "940.00", "970.00", "955.00"),
                item("EUR", "유로", "1,510.00", "1,540.00", "1,525.00")
        ));

        ExchangeRatesResponse response = service.getExchangeRates();

        assertThat(response.rates()).hasSize(3);
        assertThat(response.rates())
                .extracting(ExchangeRateItemResponse::currencyCode)
                .containsExactly("USD", "JPY", "EUR");
    }

    private KoreaEximExchangeRateItem item(
            String curUnit,
            String curName,
            String ttb,
            String tts,
            String dealBaseRate
    ) {
        return new KoreaEximExchangeRateItem(
                1,
                curUnit,
                curName,
                ttb,
                tts,
                dealBaseRate,
                null,
                null,
                null,
                null,
                null
        );
    }
}
