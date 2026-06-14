package woorifisa.project.backend.domain.exchange.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import woorifisa.project.backend.domain.exchange.dto.response.ExchangeRateItemResponse;
import woorifisa.project.backend.domain.exchange.dto.response.ExchangeRateQuoteResponse;
import woorifisa.project.backend.domain.exchange.dto.response.ExchangeRatesResponse;
import woorifisa.project.backend.domain.exchange.service.ExchangeRateService;

@WebMvcTest(ExchangeRateController.class)
class ExchangeRateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ExchangeRateService exchangeRateService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @DisplayName("메인 환율 하이라이트 조회 요청을 처리한다")
    void getHighlightsSuccess() throws Exception {
        when(exchangeRateService.getHighlights()).thenReturn(new ExchangeRatesResponse(
                "2026-06-15",
                "2026-06-15",
                "2026-06-13",
                "OPEN",
                "기준 환율입니다.",
                List.of(new ExchangeRateItemResponse(
                        "us",
                        "USD",
                        "미국 달러",
                        new BigDecimal("1363.83"),
                        new BigDecimal("1360.00"),
                        new BigDecimal("3.83"),
                        new BigDecimal("0.28"),
                        "UP"
                ))
        ));

        mockMvc.perform(get("/exchange-rates/highlights"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.marketStatus").value("OPEN"))
                .andExpect(jsonPath("$.data.rates[0].currencyCode").value("USD"));
    }

    @Test
    @DisplayName("해외송금 환율 조회 요청을 처리한다")
    void getRemittanceQuoteSuccess() throws Exception {
        when(exchangeRateService.getRemittanceQuote("us", "USD", "1000")).thenReturn(
                new ExchangeRateQuoteResponse(
                        "us",
                        "USD",
                        "미국 달러",
                        "2026-06-15",
                        "2026-06-15",
                        "OPEN",
                        "송금 보내실때 환율입니다.",
                        new BigDecimal("1377.46"),
                        new BigDecimal("1000"),
                        new BigDecimal("1377460")
                )
        );

        mockMvc.perform(get("/exchange-rates/remittance")
                        .param("countryId", "us")
                        .param("currencyCode", "USD")
                        .param("amount", "1000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.exchangeRate").value(1377.46))
                .andExpect(jsonPath("$.data.krwAmount").value(1377460));
    }
}
