import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppButton } from "../../components/design-system/AppButton";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { exchangeApi, type ExchangeRateQuoteResponse } from "../../../api";
import { transferCountries } from "../../data/transferCountries";
import { transferCurrencies } from "../../data/transferCurrencies";
import {
  formatForeignAmount,
  formatExchangeRate,
  formatKrwAmount,
  normalizeTransferAmount,
} from "./transferQuote";
import {
  useTransferBasicInfoPageStore,
  useTransferRecipientInfoPageStore,
  useTransferSenderInfoPageStore,
} from "../../stores/pageStores";
import { useTranslation } from "../../i18n";

const selectableTransferCurrencies = transferCurrencies.filter(
  (currency) => currency.code !== "KRW"
);

export function Step03TransferRateSummary() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const countryId = useTransferBasicInfoPageStore((state) => state.countryId);
  const currencyCode = useTransferBasicInfoPageStore((state) => state.currencyCode);
  const amount = useTransferBasicInfoPageStore((state) => state.amount);
  const resetTransferSenderInfo = useTransferSenderInfoPageStore((state) => state.reset);
  const resetTransferRecipientInfo = useTransferRecipientInfoPageStore((state) => state.reset);
  const [quote, setQuote] = useState<ExchangeRateQuoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadFailed, setIsLoadFailed] = useState(false);
  const selectedCountry = useMemo(
    () => transferCountries.find((item) => item.id === countryId) ?? transferCountries[0],
    [countryId]
  );
  const resolvedCurrencyCode = selectedCountry.currencyCode;
  const selectedCurrency = useMemo(
    () =>
      selectableTransferCurrencies.find((item) => item.code === resolvedCurrencyCode) ??
      selectableTransferCurrencies[0],
    [resolvedCurrencyCode]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadQuote() {
      if (!normalizeTransferAmount(amount)) {
        if (isMounted) {
          setQuote(null);
          setIsLoading(false);
          setIsLoadFailed(false);
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
        setIsLoadFailed(false);
      }

      try {
        const nextQuote = await exchangeApi.getRemittanceQuote(
          countryId,
          resolvedCurrencyCode,
          normalizeTransferAmount(amount)
        );

        if (isMounted) {
          setQuote(nextQuote);
        }
      } catch {
        if (isMounted) {
          setQuote(null);
          setIsLoadFailed(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadQuote();

    return () => {
      isMounted = false;
    };
  }, [amount, countryId, resolvedCurrencyCode]);

  const exchangeRateLabel = quote
    ? formatExchangeRate(quote.exchangeRate)
    : isLoading
      ? t("common.loading")
      : "-";
  const krwAmountLabel = quote
    ? formatKrwAmount(quote.krwAmount)
    : isLoading
      ? t("common.loading")
      : "-";
  const canProceed = !isLoading && !isLoadFailed && quote !== null;

  const summaryRows = [
    {
      label: t("globalTransfer.rateSummary.exchangeRate"),
      value: exchangeRateLabel,
      highlight: false,
    },
    {
      label: t("globalTransfer.rateSummary.remitAmount"),
      value: formatForeignAmount(selectedCurrency.code, amount),
      highlight: false,
    },
    {
      label: t("globalTransfer.rateSummary.krwAmount"),
      value: krwAmountLabel,
      highlight: true,
    },
    {
      label: t("globalTransfer.rateSummary.transferFee"),
      value: t("globalTransfer.rateSummary.feeWaived"),
      highlight: false,
    },
    {
      label: t("globalTransfer.rateSummary.cableFee"),
      value: t("globalTransfer.rateSummary.feeWaived"),
      highlight: false,
    },
  ];

  return (
    <MobileLayout
      title={t("globalTransfer.title")}
      backPath="/global-transfer/send/step-02"
      bottomContent={
        <div className="flex w-full gap-4">
          <AppButton
            variant="outline"
            onClick={() => navigate("/global-transfer/send/step-02")}
            className="flex-1 rounded-xl px-6 py-4"
          >
            {t("globalTransfer.rateSummary.prev")}
          </AppButton>
            <AppButton
              variant="primary"
              disabled={!canProceed}
              onClick={() => {
                resetTransferSenderInfo();
                resetTransferRecipientInfo();
              navigate("/global-transfer/send/step-04");
            }}
            className="flex-1 rounded-xl px-6 py-4"
          >
            {t("globalTransfer.rateSummary.next")}
          </AppButton>
        </div>
      }
    >
      <div className="space-y-8 pb-4 pt-3">
        <section className="space-y-2">
          <h1 className="text-[24px] font-semibold leading-tight text-[#132347]">
            {t("globalTransfer.rateSummary.heading")}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            {quote?.notice ?? t("globalTransfer.rateSummary.notice")}
          </p>
          {isLoadFailed ? (
            <p className="text-sm leading-6 text-red-500">
              {t("globalTransfer.rateSummary.loadFailed")}
            </p>
          ) : null}
        </section>

        <section className="overflow-hidden rounded-[24px] border border-border bg-background">
          {summaryRows.map((row, index) => (
            <div
              key={row.label}
              className={`flex items-center justify-between gap-4 px-6 py-6 ${
                index !== summaryRows.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-[17px] text-muted-foreground">{row.label}</span>
              <span
                className={`text-right text-[18px] font-semibold ${
                  row.highlight ? "text-primary" : "text-foreground"
                }`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </section>
      </div>
    </MobileLayout>
  );
}
