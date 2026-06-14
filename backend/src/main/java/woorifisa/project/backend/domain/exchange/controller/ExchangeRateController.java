package woorifisa.project.backend.domain.exchange.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import woorifisa.project.backend.domain.exchange.dto.response.ExchangeRateQuoteResponse;
import woorifisa.project.backend.domain.exchange.dto.response.ExchangeRatesResponse;
import woorifisa.project.backend.domain.exchange.service.ExchangeRateService;
import woorifisa.project.backend.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/exchange-rates")
public class ExchangeRateController {

    private final ExchangeRateService exchangeRateService;

    @GetMapping("/highlights")
    public BaseResponse<ExchangeRatesResponse> getHighlights() {
        return BaseResponse.ok(exchangeRateService.getHighlights());
    }

    @GetMapping
    public BaseResponse<ExchangeRatesResponse> getExchangeRates() {
        return BaseResponse.ok(exchangeRateService.getExchangeRates());
    }

    @GetMapping("/remittance")
    public BaseResponse<ExchangeRateQuoteResponse> getRemittanceQuote(
            @RequestParam String countryId,
            @RequestParam String currencyCode,
            @RequestParam String amount
    ) {
        return BaseResponse.ok(exchangeRateService.getRemittanceQuote(countryId, currencyCode, amount));
    }
}
