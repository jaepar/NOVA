import { useEffect, useMemo, useState } from "react";
import { CircleHelp, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppButton } from "../../components/design-system/AppButton";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { CountrySelectBottomSheet } from "../../components/transfer/CountrySelectBottomSheet";
import { formatTransferCountryName, transferCountries } from "../../data/transferCountries";
import {
  useTransferRecipientInfoPageStore,
  useTransferSenderInfoPageStore,
} from "../../stores/pageStores";
import { useProfileStore } from "../../stores/profileStore";
import { useTranslation } from "../../i18n";

function ClearableInput({
  label,
  value,
  placeholder,
  onChange,
  readOnly = false,
  trailing,
  type = "text",
  inputMode,
}: {
  label: React.ReactNode;
  value: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  trailing?: React.ReactNode;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-base text-foreground">{label}</label>
      <div className="relative mt-[6px] overflow-hidden rounded-2xl border border-border bg-background">
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          readOnly={readOnly}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          className={`h-16 w-full bg-transparent px-5 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none ${
            trailing ? "pr-16" : "pr-5"
          } ${readOnly ? "text-right" : ""}`}
        />
        {trailing ? (
          <div className="absolute inset-y-0 right-4 flex items-center">{trailing}</div>
        ) : null}
      </div>
    </div>
  );
}

export function Step04TransferSenderInfo() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const profile = useProfileStore((state) => state.profile);
  const senderName = useTransferSenderInfoPageStore((state) => state.senderName);
  const phoneNumber = useTransferSenderInfoPageStore((state) => state.phoneNumber);
  const address = useTransferSenderInfoPageStore((state) => state.address);
  const detailAddress = useTransferSenderInfoPageStore((state) => state.detailAddress);
  const district = useTransferSenderInfoPageStore((state) => state.district);
  const city = useTransferSenderInfoPageStore((state) => state.city);
  const postalCode = useTransferSenderInfoPageStore((state) => state.postalCode);
  const countryId = useTransferSenderInfoPageStore((state) => state.countryId);
  const setSenderName = useTransferSenderInfoPageStore((state) => state.setSenderName);
  const setPhoneNumber = useTransferSenderInfoPageStore((state) => state.setPhoneNumber);
  const setAddress = useTransferSenderInfoPageStore((state) => state.setAddress);
  const setDetailAddress = useTransferSenderInfoPageStore((state) => state.setDetailAddress);
  const setDistrict = useTransferSenderInfoPageStore((state) => state.setDistrict);
  const setCity = useTransferSenderInfoPageStore((state) => state.setCity);
  const setPostalCode = useTransferSenderInfoPageStore((state) => state.setPostalCode);
  const setCountryId = useTransferSenderInfoPageStore((state) => state.setCountryId);
  const resetTransferRecipientInfo = useTransferRecipientInfoPageStore((state) => state.reset);
  const [isCountrySheetOpen, setCountrySheetOpen] = useState(false);

  useEffect(() => {
    if (!senderName && profile?.name) {
      setSenderName(profile.name);
    }
  }, [profile?.name, senderName, setSenderName]);

  const selectedCountry = useMemo(
    () => transferCountries.find((item) => item.id === countryId) ?? transferCountries[0],
    [countryId]
  );
  const canProceed =
    senderName.trim().length > 0 &&
    phoneNumber.trim().length > 0 &&
    address.trim().length > 0 &&
    detailAddress.trim().length > 0 &&
    district.trim().length > 0 &&
    city.trim().length > 0 &&
    postalCode.trim().length > 0 &&
    countryId.trim().length > 0;

  const renderClearButton = (onClear: () => void) => (
    <AppButton
      type="button"
      variant="unstyled"
      onClick={onClear}
      className="rounded-full bg-muted p-1 text-muted-foreground"
      aria-label={t("globalTransfer.senderInfo.clearAria")}
    >
      <X className="h-4 w-4" />
    </AppButton>
  );

  return (
    <>
      <MobileLayout
        title={t("globalTransfer.title")}
        backPath="/global-transfer/send/step-03"
        bottomContent={
          <div className="flex w-full gap-4">
            <AppButton
              variant="outline"
              onClick={() => navigate("/global-transfer/send/step-03")}
              className="flex-1 rounded-xl px-6 py-4"
            >
              {t("globalTransfer.senderInfo.prev")}
            </AppButton>
            <AppButton
              variant="primary"
              disabled={!canProceed}
              onClick={() => {
                resetTransferRecipientInfo();
                navigate("/global-transfer/send/step-05");
              }}
              className="flex-1 rounded-xl px-6 py-4"
            >
              {t("globalTransfer.senderInfo.next")}
            </AppButton>
          </div>
        }
      >
        <div className="space-y-8 pb-4 pt-3">
          <section className="space-y-2">
            <h1 className="text-[24px] font-semibold leading-tight text-[#132347]">
              {t("globalTransfer.senderInfo.heading")}
            </h1>
          </section>

          <section className="space-y-6">
            <ClearableInput
              label={
                <>
                  {t("globalTransfer.senderInfo.nameLabel")}
                  <CircleHelp className="h-5 w-5 text-muted-foreground" />
                </>
              }
              value={senderName}
              onChange={setSenderName}
            />

            <ClearableInput
              label={
                <>
                  {t("globalTransfer.senderInfo.phoneLabel")}
                  <CircleHelp className="h-5 w-5 text-muted-foreground" />
                </>
              }
              value={phoneNumber}
              onChange={setPhoneNumber}
              inputMode="tel"
              trailing={phoneNumber ? renderClearButton(() => setPhoneNumber("")) : undefined}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-base text-foreground">
                  {t("globalTransfer.senderInfo.addressLabel")}
                </label>
                <AppButton
                  type="button"
                  variant="unstyled"
                  onClick={() => {}}
                  className="flex items-center gap-1 text-base font-medium text-primary"
                >
                  {t("globalTransfer.senderInfo.addressSearch")}
                  <span aria-hidden="true">›</span>
                </AppButton>
              </div>
              <div className="mt-[6px] overflow-hidden rounded-2xl border border-border bg-background">
                <input
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="h-16 w-full bg-transparent px-5 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            <ClearableInput
              label={t("globalTransfer.senderInfo.detailLabel")}
              value={detailAddress}
              onChange={setDetailAddress}
              trailing={detailAddress ? renderClearButton(() => setDetailAddress("")) : undefined}
            />

            <ClearableInput
              label={t("globalTransfer.senderInfo.districtLabel")}
              value={district}
              onChange={setDistrict}
              trailing={district ? renderClearButton(() => setDistrict("")) : undefined}
            />

            <ClearableInput
              label={t("globalTransfer.senderInfo.cityLabel")}
              value={city}
              onChange={setCity}
              trailing={city ? renderClearButton(() => setCity("")) : undefined}
            />

            <ClearableInput
              label={t("globalTransfer.senderInfo.postalCodeLabel")}
              value={postalCode}
              onChange={setPostalCode}
              trailing={postalCode ? renderClearButton(() => setPostalCode("")) : undefined}
            />

            <div className="space-y-2">
              <label className="block text-base text-foreground">
                {t("globalTransfer.senderInfo.countryLabel")}
              </label>
              <AppButton
                type="button"
                variant="unstyled"
                onClick={() => setCountrySheetOpen(true)}
                className="mt-[6px] flex w-full items-center justify-between rounded-2xl border border-border bg-background px-5 py-5 text-left text-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <span className="min-w-0 truncate">
                  {formatTransferCountryName(selectedCountry, language)}
                </span>
                <Search className="h-6 w-6 shrink-0 text-muted-foreground" />
              </AppButton>
            </div>
          </section>
        </div>
      </MobileLayout>

      <CountrySelectBottomSheet
        countries={transferCountries}
        selectedCountryId={selectedCountry.id}
        isOpen={isCountrySheetOpen}
        onClose={() => setCountrySheetOpen(false)}
        onSelect={(country) => {
          setCountryId(country.id);
          setCountrySheetOpen(false);
        }}
      />
    </>
  );
}
