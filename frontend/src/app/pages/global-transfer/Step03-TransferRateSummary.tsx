import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppButton } from "../../components/design-system/AppButton";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { transferCurrencies } from "../../data/transferCurrencies";
import {
  formatForeignAmount,
  formatKrwAmount,
  MOCK_TRANSFER_EXCHANGE_RATE,
} from "./transferQuote";
import {
  useTransferBasicInfoPageStore,
  useTransferRecipientInfoPageStore,
  useTransferSenderInfoPageStore,
} from "../../stores/pageStores";
import { useTranslation } from "../../i18n";

export function Step03TransferRateSummary() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currencyCode = useTransferBasicInfoPageStore((state) => state.currencyCode);
  const amount = useTransferBasicInfoPageStore((state) => state.amount);
  const resetTransferSenderInfo = useTransferSenderInfoPageStore((state) => state.reset);
  const resetTransferRecipientInfo = useTransferRecipientInfoPageStore((state) => state.reset);
  const selectedCurrency = useMemo(
    () => transferCurrencies.find((item) => item.code === currencyCode) ?? transferCurrencies[0],
    [currencyCode]
  );

  const summaryRows = [
    {
      label: t("globalTransfer.rateSummary.exchangeRate"),
      value: `KRW ${MOCK_TRANSFER_EXCHANGE_RATE.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      highlight: false,
    },
    {
      label: t("globalTransfer.rateSummary.remitAmount"),
      value: formatForeignAmount(selectedCurrency.code, amount),
      highlight: false,
    },
    {
      label: t("globalTransfer.rateSummary.krwAmount"),
      value: formatKrwAmount(amount),
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
            {t("globalTransfer.rateSummary.notice")}
          </p>
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
