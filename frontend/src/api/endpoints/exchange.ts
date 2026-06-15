import apiClient from "../client";

type ExchangeApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

export type ExchangeMarketStatus = "OPEN" | "WEEKEND" | "HOLIDAY" | "PRE_OPEN";
export type ExchangeRateChangeDirection = "UP" | "DOWN" | "FLAT";

export type ExchangeRateApiItem = {
  countryId: string;
  currencyCode: string;
  currencyName: string;
  rate: number;
  previousRate: number;
  changeRate: number;
  changePercent: number;
  changeDirection: ExchangeRateChangeDirection;
};

export type ExchangeRatesResponse = {
  requestedDate: string;
  effectiveDate: string;
  comparisonDate: string;
  marketStatus: ExchangeMarketStatus;
  notice: string;
  rates: ExchangeRateApiItem[];
};

export type ExchangeRateQuoteResponse = {
  countryId: string;
  currencyCode: string;
  currencyName: string;
  requestedDate: string;
  effectiveDate: string;
  marketStatus: ExchangeMarketStatus;
  notice: string;
  exchangeRate: number;
  remitAmount: number;
  krwAmount: number;
};

export const exchangeApi = {
  getHighlights: async (): Promise<ExchangeRatesResponse> => {
    const response = await apiClient.get<ExchangeApiResponse<ExchangeRatesResponse>>(
      "/exchange-rates/highlights"
    );

    return response.data.data;
  },
  getExchangeRates: async (): Promise<ExchangeRatesResponse> => {
    const response = await apiClient.get<ExchangeApiResponse<ExchangeRatesResponse>>(
      "/exchange-rates"
    );

    return response.data.data;
  },
  getRemittanceQuote: async (
    countryId: string,
    currencyCode: string,
    amount: string
  ): Promise<ExchangeRateQuoteResponse> => {
    const response = await apiClient.get<ExchangeApiResponse<ExchangeRateQuoteResponse>>(
      "/exchange-rates/remittance",
      {
        params: {
          countryId,
          currencyCode,
          amount,
        },
      }
    );

    return response.data.data;
  },
};
