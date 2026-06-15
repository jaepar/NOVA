import { useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  bankingApi,
  createIdempotencyKey,
  exchangeApi,
  getBankingApiError,
  type CreateGlobalTransactionRequest,
} from "../../../api";
import { AppButton } from "../../components/design-system/AppButton";
import { SegmentedOptionField } from "../../components/design-system/SegmentedOptionField";
import { BottomSheet } from "../../components/layout/BottomSheet";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { transferCountries } from "../../data/transferCountries";
import {
  useTransferBasicInfoPageStore,
  useTransferRecipientInfoPageStore,
  useTransferSenderInfoPageStore,
} from "../../stores/pageStores";
import { translateError, useTranslation } from "../../i18n";
import { getDialCodeByCountryId, PhoneNumberField } from "./PhoneNumberField";
import { normalizeTransferAmount, toTransferAmountNumber } from "./transferQuote";
import { isValidEnglishName, isValidPhoneNumber } from "./transferValidation";

const paymentReasonOptions = ["tuition", "living", "family", "medical", "transaction", "other"] as const;

type PaymentReason = (typeof paymentReasonOptions)[number];
type RecipientSelectionSheet = "payment-reason" | null;

function ClearableInput({
  label,
  value,
  onChange,
  trailing,
  placeholder,
  multiline = false,
  labelAction,
  inputMode,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  trailing?: React.ReactNode;
  placeholder?: string;
  multiline?: boolean;
  labelAction?: React.ReactNode;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-base text-foreground">{label}</label>
        {labelAction}
      </div>
      <div
        className={`relative mt-[6px] overflow-hidden rounded-2xl border bg-background ${
          error ? "border-destructive" : "border-border"
        }`}
      >
        {multiline ? (
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            className="min-h-24 w-full resize-none bg-transparent px-5 py-4 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        ) : (
          <input
            type="text"
            inputMode={inputMode}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            className={`h-16 w-full bg-transparent px-5 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none ${
              trailing ? "pr-16" : "pr-5"
            }`}
          />
        )}
        {trailing ? (
          <div className="absolute inset-y-0 right-4 flex items-center">{trailing}</div>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function Step05TransferRecipientInfo() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const purpose = useTransferBasicInfoPageStore((state) => state.purpose);
  const countryId = useTransferBasicInfoPageStore((state) => state.countryId);
  const currencyCode = useTransferBasicInfoPageStore((state) => state.currencyCode);
  const amount = useTransferBasicInfoPageStore((state) => state.amount);
  const feeBurden = useTransferBasicInfoPageStore((state) => state.feeBurden);
  const senderName = useTransferSenderInfoPageStore((state) => state.senderName);
  const senderPhone = useTransferSenderInfoPageStore((state) => state.phoneNumber);
  const senderAddress = useTransferSenderInfoPageStore((state) => state.address);
  const senderDetailAddress = useTransferSenderInfoPageStore((state) => state.detailAddress);
  const senderDistrict = useTransferSenderInfoPageStore((state) => state.district);
  const senderCity = useTransferSenderInfoPageStore((state) => state.city);
  const senderPostalCode = useTransferSenderInfoPageStore((state) => state.postalCode);
  const senderCountryId = useTransferSenderInfoPageStore((state) => state.countryId);
  const recipientName = useTransferRecipientInfoPageStore((state) => state.recipientName);
  const recipientDetailAddress = useTransferRecipientInfoPageStore(
    (state) => state.recipientDetailAddress
  );
  const recipientDistrict = useTransferRecipientInfoPageStore((state) => state.recipientDistrict);
  const recipientCity = useTransferRecipientInfoPageStore((state) => state.recipientCity);
  const recipientPostalCode = useTransferRecipientInfoPageStore(
    (state) => state.recipientPostalCode
  );
  const recipientPhoneNumber = useTransferRecipientInfoPageStore(
    (state) => state.recipientPhoneNumber
  );
  const swiftCode = useTransferRecipientInfoPageStore((state) => state.swiftCode);
  const accountNumber = useTransferRecipientInfoPageStore((state) => state.accountNumber);
  const routingNumber = useTransferRecipientInfoPageStore((state) => state.routingNumber);
  const bankBranchName = useTransferRecipientInfoPageStore((state) => state.bankBranchName);
  const paymentDetailMode = useTransferRecipientInfoPageStore(
    (state) => state.paymentDetailMode
  );
  const paymentReason = useTransferRecipientInfoPageStore((state) => state.paymentReason);
  const manualPaymentDetail = useTransferRecipientInfoPageStore(
    (state) => state.manualPaymentDetail
  );
  const setRecipientName = useTransferRecipientInfoPageStore((state) => state.setRecipientName);
  const setRecipientDetailAddress = useTransferRecipientInfoPageStore(
    (state) => state.setRecipientDetailAddress
  );
  const setRecipientDistrict = useTransferRecipientInfoPageStore(
    (state) => state.setRecipientDistrict
  );
  const setRecipientCity = useTransferRecipientInfoPageStore((state) => state.setRecipientCity);
  const setRecipientPostalCode = useTransferRecipientInfoPageStore(
    (state) => state.setRecipientPostalCode
  );
  const setRecipientPhoneNumber = useTransferRecipientInfoPageStore(
    (state) => state.setRecipientPhoneNumber
  );
  const setSwiftCode = useTransferRecipientInfoPageStore((state) => state.setSwiftCode);
  const setAccountNumber = useTransferRecipientInfoPageStore((state) => state.setAccountNumber);
  const setRoutingNumber = useTransferRecipientInfoPageStore((state) => state.setRoutingNumber);
  const setBankBranchName = useTransferRecipientInfoPageStore((state) => state.setBankBranchName);
  const setPaymentDetailMode = useTransferRecipientInfoPageStore(
    (state) => state.setPaymentDetailMode
  );
  const setPaymentReason = useTransferRecipientInfoPageStore((state) => state.setPaymentReason);
  const setManualPaymentDetail = useTransferRecipientInfoPageStore(
    (state) => state.setManualPaymentDetail
  );
  const [openSheet, setOpenSheet] = useState<RecipientSelectionSheet>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedCountry =
    transferCountries.find((country) => country.id === countryId) ?? transferCountries[0];
  const resolvedCurrencyCode = selectedCountry.currencyCode;

  const paymentDetailOptions = [
    { label: t("globalTransfer.recipientInfo.reasonSelect"), value: "reason-select" as const },
    { label: t("globalTransfer.recipientInfo.manualInput"), value: "manual-input" as const },
  ];
  const selectedPaymentReason = paymentReasonOptions.includes(paymentReason as PaymentReason)
    ? paymentReason
    : "";
  const isRecipientNameValid = isValidEnglishName(recipientName);
  const isRecipientPhoneNumberValid = isValidPhoneNumber(recipientPhoneNumber);
  const recipientNameError =
    recipientName.trim().length > 0 && !isRecipientNameValid
      ? t("globalTransfer.recipientInfo.nameError")
      : "";
  const recipientPhoneNumberError =
    recipientPhoneNumber.trim().length > 0 && !isRecipientPhoneNumberValid
      ? t("globalTransfer.recipientInfo.phoneError")
      : "";

  const renderClearButton = (onClear: () => void) => (
    <AppButton
      type="button"
      variant="unstyled"
      onClick={onClear}
      className="rounded-full bg-muted p-1 text-muted-foreground"
      aria-label={t("globalTransfer.recipientInfo.clearAria")}
    >
      <X className="h-4 w-4" />
    </AppButton>
  );

  const canProceed =
    isRecipientNameValid &&
    recipientDetailAddress.trim().length > 0 &&
    recipientCity.trim().length > 0 &&
    isRecipientPhoneNumberValid &&
    swiftCode.trim().length > 0 &&
    accountNumber.trim().length > 0 &&
    routingNumber.trim().length > 0 &&
    bankBranchName.trim().length > 0 &&
    (paymentDetailMode === "reason-select"
      ? selectedPaymentReason.length > 0
      : manualPaymentDetail.trim().length > 0);

  const buildRemitReason = () =>
    paymentDetailMode === "reason-select" ? selectedPaymentReason : manualPaymentDetail.trim();

  const handleSubmit = async () => {
    if (!canProceed || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const idempotencyKey = createIdempotencyKey();
    let payload: CreateGlobalTransactionRequest | undefined;

    try {
      const accountHome = await bankingApi.getHome();
      const accountId = accountHome.account?.accountId;

      if (!accountId) {
        throw new Error("ACCOUNT_NOT_FOUND");
      }

      const quote = await exchangeApi.getRemittanceQuote(
        countryId,
        resolvedCurrencyCode,
        normalizeTransferAmount(amount)
      );

      payload = {
        accountId,
        remitPurpose: purpose,
        targetCountry: countryId.toUpperCase(),
        currency: resolvedCurrencyCode,
        remitAmount: toTransferAmountNumber(amount).toFixed(2),
        mediaryFeePayer: feeBurden === "sender" ? "SENDER" : "RECEIVER",
        exchangeRate: quote.exchangeRate.toFixed(6),
        krwAmount: Math.round(quote.krwAmount).toString(),
        senderEngName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        senderAddressDetail: `${senderAddress} ${senderDetailAddress}`.trim(),
        senderDistrict: senderDistrict.trim(),
        senderCity: senderCity.trim(),
        senderZipCode: senderPostalCode.trim(),
        senderCountry: senderCountryId.toUpperCase(),
        receiverEngName: recipientName.trim(),
        receiverAddressDetail: recipientDetailAddress.trim(),
        receiverDistrict: recipientDistrict.trim() || null,
        receiverCity: recipientCity.trim(),
        receiverZipCode: recipientPostalCode.trim() || null,
        receiverPhone: recipientPhoneNumber.trim(),
        swiftCode: swiftCode.trim(),
        receiverAccountNum: accountNumber.trim(),
        routingNumber: routingNumber.trim(),
        bankName: bankBranchName.trim(),
        remitReason: buildRemitReason(),
      };

      await bankingApi.createGlobalTransaction(payload, idempotencyKey);
      navigate("/global-transfer/send/step-06");
    } catch (error) {
      const apiError = getBankingApiError(error);
      navigate("/global-transfer/send/step-06-failed", {
        state: {
          payload,
          idempotencyKey,
          translatedMessage: translateError(
            apiError?.code,
            t("globalTransfer.submitFailed.fallbackError")
          ),
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <MobileLayout
        title={t("globalTransfer.title")}
        backPath="/global-transfer/send/step-04"
        bottomContent={
          <div className="flex w-full gap-4">
            <AppButton
              variant="outline"
              onClick={() => navigate("/global-transfer/send/step-04")}
              className="flex-1 rounded-xl px-6 py-4"
            >
              {t("globalTransfer.recipientInfo.prev")}
            </AppButton>
            <AppButton
              variant="primary"
              disabled={!canProceed || isSubmitting}
              onClick={handleSubmit}
              className="flex-1 rounded-xl px-6 py-4"
            >
              {isSubmitting
                ? t("globalTransfer.recipientInfo.submitting")
                : t("globalTransfer.recipientInfo.next")}
            </AppButton>
          </div>
        }
      >
        <div className="space-y-8 pb-4 pt-3">
          <section className="space-y-2">
            <h1 className="text-[24px] font-semibold leading-tight text-[#132347]">
              {t("globalTransfer.recipientInfo.heading")}
            </h1>
          </section>

          <section className="space-y-6">
            <ClearableInput
              label={t("globalTransfer.recipientInfo.nameLabel")}
              value={recipientName}
              onChange={setRecipientName}
              error={recipientNameError}
              trailing={recipientName ? renderClearButton(() => setRecipientName("")) : undefined}
            />

            <div className="space-y-2">
              <label className="block text-base text-foreground">
                {t("globalTransfer.recipientInfo.addressLabel")}
              </label>
            </div>

            <ClearableInput
              label={t("globalTransfer.recipientInfo.detailLabel")}
              value={recipientDetailAddress}
              onChange={setRecipientDetailAddress}
              trailing={
                recipientDetailAddress
                  ? renderClearButton(() => setRecipientDetailAddress(""))
                  : undefined
              }
            />

            <ClearableInput
              label={t("globalTransfer.recipientInfo.districtLabel")}
              value={recipientDistrict}
              placeholder={t("globalTransfer.recipientInfo.districtPlaceholder")}
              onChange={setRecipientDistrict}
              trailing={
                recipientDistrict ? renderClearButton(() => setRecipientDistrict("")) : undefined
              }
            />

            <ClearableInput
              label={t("globalTransfer.recipientInfo.cityLabel")}
              value={recipientCity}
              onChange={setRecipientCity}
              trailing={recipientCity ? renderClearButton(() => setRecipientCity("")) : undefined}
            />

            <ClearableInput
              label={t("globalTransfer.recipientInfo.postalCodeLabel")}
              value={recipientPostalCode}
              placeholder={t("globalTransfer.recipientInfo.postalCodePlaceholder")}
              onChange={setRecipientPostalCode}
              trailing={
                recipientPostalCode
                  ? renderClearButton(() => setRecipientPostalCode(""))
                  : undefined
              }
            />

            <PhoneNumberField
              label={t("globalTransfer.recipientInfo.phoneLabel")}
              value={recipientPhoneNumber}
              onChange={setRecipientPhoneNumber}
              placeholder={t("globalTransfer.recipientInfo.phonePlaceholder")}
              error={recipientPhoneNumberError}
              defaultDialCode={getDialCodeByCountryId(countryId)}
              countryCodeAriaLabel={t("globalTransfer.recipientInfo.countryCodeAria")}
              clearAriaLabel={t("globalTransfer.recipientInfo.clearAria")}
            />
          </section>

          <section className="space-y-6">
            <h2 className="text-[20px] font-semibold leading-tight text-[#132347]">
              {t("globalTransfer.recipientInfo.bankInfoHeading")}
            </h2>

            <ClearableInput
              label={t("globalTransfer.recipientInfo.swiftCodeLabel")}
              value={swiftCode}
              onChange={setSwiftCode}
              labelAction={
                <AppButton
                  type="button"
                  variant="unstyled"
                  onClick={() => navigate("/global-transfer/send/step-05/swift-code-lookup")}
                  className="flex items-center gap-1 text-base font-medium text-primary"
                >
                  {t("globalTransfer.recipientInfo.swiftLookup")}
                  <ChevronRight className="h-4 w-4" />
                </AppButton>
              }
              trailing={swiftCode ? renderClearButton(() => setSwiftCode("")) : undefined}
            />

            <ClearableInput
              label={t("globalTransfer.recipientInfo.accountLabel")}
              value={accountNumber}
              onChange={setAccountNumber}
              trailing={accountNumber ? renderClearButton(() => setAccountNumber("")) : undefined}
            />

            <ClearableInput
              label={t("globalTransfer.recipientInfo.routingLabel")}
              value={routingNumber}
              onChange={setRoutingNumber}
              placeholder={t("globalTransfer.recipientInfo.routingPlaceholder")}
              inputMode="numeric"
            />

            <ClearableInput
              label={t("globalTransfer.recipientInfo.bankBranchLabel")}
              value={bankBranchName}
              onChange={setBankBranchName}
            />
          </section>

          <section className="space-y-6">
            <div className="space-y-3">
              <label className="block text-base text-foreground">
                {t("globalTransfer.recipientInfo.paymentDetailsLabel")}
              </label>
              <SegmentedOptionField
                options={paymentDetailOptions}
                value={paymentDetailMode}
                onChange={setPaymentDetailMode}
              />
            </div>

            {paymentDetailMode === "reason-select" ? (
              <div className="space-y-2">
                <label className="block text-base text-foreground">
                  {t("globalTransfer.recipientInfo.paymentReasonLabel")}
                </label>
                <AppButton
                  type="button"
                  variant="unstyled"
                  onClick={() => setOpenSheet("payment-reason")}
                  className="mt-[6px] flex w-full items-center justify-between rounded-2xl border border-border bg-background px-5 py-5 text-left text-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <span
                    className={
                      selectedPaymentReason ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {selectedPaymentReason
                      ? t(`globalTransfer.recipientInfo.reasons.${selectedPaymentReason}`)
                      : t("globalTransfer.recipientInfo.paymentReasonPlaceholder")}
                  </span>
                  <ChevronDown className="h-6 w-6 shrink-0 text-muted-foreground" />
                </AppButton>
              </div>
            ) : (
              <ClearableInput
                label={t("globalTransfer.recipientInfo.paymentReasonLabel")}
                value={manualPaymentDetail}
                onChange={setManualPaymentDetail}
                placeholder={t("globalTransfer.recipientInfo.paymentReasonManualPlaceholder")}
                multiline
              />
            )}
          </section>
        </div>
      </MobileLayout>

      <BottomSheet
        isOpen={openSheet === "payment-reason"}
        onClose={() => setOpenSheet(null)}
        title=""
        height="480px"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-2">
            <p className="text-lg font-semibold text-foreground">
              {t("globalTransfer.recipientInfo.paymentReasonSheetTitle")}
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
            {paymentReasonOptions.map((option) => (
              <AppButton
                key={option}
                type="button"
                variant="unstyled"
                onClick={() => {
                  setPaymentReason(option);
                  setOpenSheet(null);
                }}
                className="w-full px-4 py-4 text-left text-foreground transition-colors hover:bg-secondary"
              >
                {t(`globalTransfer.recipientInfo.reasons.${option}`)}
              </AppButton>
            ))}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
