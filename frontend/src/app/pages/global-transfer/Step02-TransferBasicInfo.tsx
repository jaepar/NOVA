import { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, Check, CircleHelp, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppButton } from "../../components/design-system/AppButton";
import { SegmentedOptionField } from "../../components/design-system/SegmentedOptionField";
import { BottomSheet } from "../../components/layout/BottomSheet";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { CountrySelectBottomSheet } from "../../components/transfer/CountrySelectBottomSheet";
import { TRANSFER_BOTTOM_SHEET_HEIGHT } from "../../components/transfer/transferSheetConfig";
import {
  formatTransferCountryName,
  transferRemittanceCountries,
} from "../../data/transferCountries";
import { getTransferCurrencyName, transferCurrencies } from "../../data/transferCurrencies";
import {
  useTransferBasicInfoPageStore,
  useTransferRecipientInfoPageStore,
  useTransferSenderInfoPageStore,
} from "../../stores/pageStores";
import { useTranslation } from "../../i18n";

const transferPurposeOptions = [
  "resident",
  "student",
  "overseas",
  "foreigner",
  "nonResidentAsset",
  "emigration",
  "externalAccount",
  "nonResidentFree",
] as const;

type TransferPurpose = (typeof transferPurposeOptions)[number];
type SelectionSheet = "purpose" | "country" | "currency" | null;

const selectableTransferCurrencies = transferCurrencies.filter(
  (currency) => currency.code !== "KRW"
);

function formatTransferAmount(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}

export function Step02TransferBasicInfo() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const purpose = useTransferBasicInfoPageStore((state) => state.purpose);
  const countryId = useTransferBasicInfoPageStore((state) => state.countryId);
  const currencyCode = useTransferBasicInfoPageStore((state) => state.currencyCode);
  const amount = useTransferBasicInfoPageStore((state) => state.amount);
  const feeBurden = useTransferBasicInfoPageStore((state) => state.feeBurden);
  const setPurpose = useTransferBasicInfoPageStore((state) => state.setPurpose);
  const setCountryId = useTransferBasicInfoPageStore((state) => state.setCountryId);
  const setCurrencyCode = useTransferBasicInfoPageStore((state) => state.setCurrencyCode);
  const setAmount = useTransferBasicInfoPageStore((state) => state.setAmount);
  const setFeeBurden = useTransferBasicInfoPageStore((state) => state.setFeeBurden);
  const resetTransferSenderInfo = useTransferSenderInfoPageStore((state) => state.reset);
  const resetTransferRecipientInfo = useTransferRecipientInfoPageStore((state) => state.reset);
  const setSwiftCode = useTransferRecipientInfoPageStore((state) => state.setSwiftCode);
  const setAccountNumber = useTransferRecipientInfoPageStore((state) => state.setAccountNumber);
  const setRoutingNumber = useTransferRecipientInfoPageStore((state) => state.setRoutingNumber);
  const setBankBranchName = useTransferRecipientInfoPageStore((state) => state.setBankBranchName);
  const [openSheet, setOpenSheet] = useState<SelectionSheet>(null);

  const feeBurdenOptions = useMemo(
    () => [
      { label: t("globalTransfer.basicInfo.feeSender"), value: "sender" as const },
      { label: t("globalTransfer.basicInfo.feeReceiver"), value: "receiver" as const },
    ],
    [t]
  );
  const selectedCountry = useMemo(
    () =>
      transferRemittanceCountries.find((item) => item.id === countryId) ??
      transferRemittanceCountries[0],
    [countryId]
  );
  const availableCurrencies = useMemo(
    () =>
      selectableTransferCurrencies.filter((currency) => currency.code === selectedCountry.currencyCode),
    [selectedCountry]
  );
  const selectedCurrency = useMemo(
    () =>
      availableCurrencies.find((item) => item.code === currencyCode) ??
      availableCurrencies[0] ??
      selectableTransferCurrencies[0],
    [availableCurrencies, currencyCode]
  );
  const selectedPurpose = transferPurposeOptions.includes(purpose as TransferPurpose)
    ? purpose
    : "resident";
  const canProceed =
    selectedPurpose.length > 0 &&
    countryId.length > 0 &&
    currencyCode.length > 0 &&
    amount.replace(/\D/g, "").length > 0;

  const handleCurrencySelect = (nextCurrencyCode: string) => {
    setCurrencyCode(nextCurrencyCode);
    setOpenSheet(null);
  };

  useEffect(() => {
    if (currencyCode !== selectedCountry.currencyCode) {
      setCurrencyCode(selectedCountry.currencyCode);
    }
  }, [currencyCode, selectedCountry, setCurrencyCode]);

  return (
    <>
      <MobileLayout
        title={t("globalTransfer.title")}
        backPath="/global-transfer/send/step-01"
        bottomContent={
          <div className="flex w-full gap-4">
            <AppButton
              variant="outline"
              onClick={() => navigate("/global-transfer/send/step-01")}
              className="flex-1 rounded-xl px-6 py-4"
            >
              {t("globalTransfer.basicInfo.prev")}
            </AppButton>
            <AppButton
              variant="primary"
              disabled={!canProceed}
              onClick={() => {
                resetTransferSenderInfo();
                resetTransferRecipientInfo();
                navigate("/global-transfer/send/step-03");
              }}
              className="flex-1 rounded-xl px-6 py-4"
            >
              {t("globalTransfer.basicInfo.next")}
            </AppButton>
          </div>
        }
      >
        <div className="space-y-8 pb-4 pt-3">
          <section className="space-y-2">
            <h1 className="text-[24px] font-semibold leading-tight text-[#132347]">
              {t("globalTransfer.basicInfo.heading")}
            </h1>
          </section>

          <section className="space-y-6">
            <div className="space-y-2">
              <label className="block text-base text-foreground">
                {t("globalTransfer.basicInfo.purposeLabel")}
              </label>
              <AppButton
                type="button"
                variant="unstyled"
                onClick={() => setOpenSheet("purpose")}
                className="mt-[6px] flex w-full items-center justify-between rounded-2xl border border-border bg-background px-5 py-5 text-left text-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <span className="min-w-0 truncate">
                  {t(`globalTransfer.basicInfo.purposes.${selectedPurpose}`)}
                </span>
                <ChevronDown className="h-6 w-6 shrink-0 text-muted-foreground" />
              </AppButton>
            </div>

            <div className="space-y-2">
              <label className="block text-base text-foreground">
                {t("globalTransfer.basicInfo.countryLabel")}
              </label>
              <AppButton
                type="button"
                variant="unstyled"
                onClick={() => setOpenSheet("country")}
                className="mt-[6px] flex w-full items-center justify-between rounded-2xl border border-border bg-background px-5 py-5 text-left text-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <span className="min-w-0 truncate">
                  {formatTransferCountryName(selectedCountry, language)}
                </span>
                <Search className="h-6 w-6 shrink-0 text-muted-foreground" />
              </AppButton>
            </div>

            <div className="space-y-2">
              <label className="block text-base text-foreground">
                {t("globalTransfer.basicInfo.currencyLabel")}
              </label>
              <AppButton
                type="button"
                variant="unstyled"
                onClick={() => setOpenSheet("currency")}
                className="mt-[6px] flex w-full items-center justify-between rounded-2xl border border-border bg-background px-5 py-5 text-left text-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <span className="flex min-w-0 items-center gap-3 truncate">
                  <span className="inline-flex items-center justify-center text-2xl leading-none">
                    {selectedCurrency.flag}
                  </span>
                  <span className="truncate">{getTransferCurrencyName(selectedCurrency, language)}</span>
                </span>
                <ChevronDown className="h-6 w-6 shrink-0 text-muted-foreground" />
              </AppButton>
            </div>

            <div className="space-y-2">
              <label className="block text-base text-foreground">
                {t("globalTransfer.basicInfo.amountLabel")}
              </label>
              <div className="relative mt-[6px] overflow-hidden rounded-2xl border border-border bg-background">
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(event) => setAmount(formatTransferAmount(event.target.value))}
                  placeholder={t("globalTransfer.basicInfo.amountPlaceholder")}
                  className="h-16 w-full bg-transparent px-5 pr-28 text-right text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center gap-3 text-lg text-muted-foreground">
                  <span>.</span>
                  <span>00</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="block text-base text-foreground">
                  {t("globalTransfer.basicInfo.feeLabel")}
                </label>
                <CircleHelp className="h-5 w-5 text-muted-foreground" />
              </div>
              <SegmentedOptionField
                options={feeBurdenOptions}
                value={feeBurden}
                onChange={setFeeBurden}
              />
            </div>
          </section>
        </div>
      </MobileLayout>

      <BottomSheet
        isOpen={openSheet === "purpose"}
        onClose={() => setOpenSheet(null)}
        title=""
        height={TRANSFER_BOTTOM_SHEET_HEIGHT}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-2">
            <p className="text-lg font-semibold text-foreground">
              {t("globalTransfer.basicInfo.purposeSheetTitle")}
            </p>
            <AppButton
              type="button"
              variant="unstyled"
              onClick={() => setOpenSheet(null)}
              className="p-1 text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </AppButton>
          </div>
          <div className="divide-y divide-border rounded-2xl border border-border bg-background">
            {transferPurposeOptions.map((option) => {
              const isSelected = selectedPurpose === option;

              return (
                <AppButton
                  key={option}
                  type="button"
                  variant="unstyled"
                  onClick={() => {
                    setPurpose(option);
                    setOpenSheet(null);
                  }}
                  className="flex w-full items-center justify-between px-4 py-4 text-left text-foreground transition-colors hover:bg-secondary"
                >
                  <span className="pr-3">
                    {t(`globalTransfer.basicInfo.purposes.${option}`)}
                  </span>
                  {isSelected ? <Check className="h-5 w-5 shrink-0 text-primary" /> : null}
                </AppButton>
              );
            })}
          </div>
        </div>
      </BottomSheet>

      <CountrySelectBottomSheet
        countries={transferRemittanceCountries}
        selectedCountryId={selectedCountry.id}
        isOpen={openSheet === "country"}
        onClose={() => setOpenSheet(null)}
        onSelect={(country) => {
          const isCountryChanged = country.id !== selectedCountry.id;
          setCountryId(country.id);
          setCurrencyCode(country.currencyCode);
          if (isCountryChanged) {
            setSwiftCode("");
            setAccountNumber("");
            setRoutingNumber("");
            setBankBranchName("");
          }
          setOpenSheet(null);
        }}
        title={t("globalTransfer.basicInfo.countrySheetTitle")}
      />

      <BottomSheet
        isOpen={openSheet === "currency"}
        onClose={() => setOpenSheet(null)}
        title=""
        height={TRANSFER_BOTTOM_SHEET_HEIGHT}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-2">
            <p className="text-lg font-semibold text-foreground">
              {t("globalTransfer.basicInfo.currencySheetTitle")}
            </p>
            <AppButton
              type="button"
              variant="unstyled"
              onClick={() => setOpenSheet(null)}
              className="p-1 text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </AppButton>
          </div>
          <div className="divide-y divide-border rounded-2xl border border-border bg-background">
            {availableCurrencies.map((currency) => {
              const isSelected = selectedCurrency.code === currency.code;

              return (
                <AppButton
                  key={currency.code}
                  type="button"
                  variant="unstyled"
                  onClick={() => handleCurrencySelect(currency.code)}
                  className="flex w-full items-center justify-between px-4 py-4 text-left text-foreground transition-colors hover:bg-secondary"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex items-center justify-center text-2xl leading-none">
                      {currency.flag}
                    </span>
                    <span className="truncate">
                      {getTransferCurrencyName(currency, language)} ({currency.code})
                    </span>
                  </span>
                  {isSelected ? <Check className="h-5 w-5 shrink-0 text-primary" /> : null}
                </AppButton>
              );
            })}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
