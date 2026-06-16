import { useEffect, useMemo, useRef, useState } from "react";
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
import { getDialCodeByCountryId, PhoneNumberField } from "./PhoneNumberField";
import { isValidEnglishName, isValidPhoneNumber } from "./transferValidation";

const KAKAO_POSTCODE_SCRIPT_ID = "kakao-postcode-script";
const KAKAO_POSTCODE_SCRIPT_SRC =
  "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

let kakaoPostcodeScriptPromise: Promise<void> | null = null;

function loadKakaoPostcodeScript() {
  if (window.kakao?.Postcode) {
    return Promise.resolve();
  }

  if (kakaoPostcodeScriptPromise) {
    return kakaoPostcodeScriptPromise;
  }

  kakaoPostcodeScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(KAKAO_POSTCODE_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => {
          kakaoPostcodeScriptPromise = null;
          reject(new Error("Kakao postcode load failed"));
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = KAKAO_POSTCODE_SCRIPT_ID;
    script.src = KAKAO_POSTCODE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      kakaoPostcodeScriptPromise = null;
      reject(new Error("Kakao postcode load failed"));
    };
    document.head.appendChild(script);
  });

  return kakaoPostcodeScriptPromise;
}

function resolveEnglishAddress(data: {
  roadAddressEnglish?: string;
  addressEnglish?: string;
  jibunAddressEnglish?: string;
  autoRoadAddressEnglish?: string;
  autoJibunAddressEnglish?: string;
}) {
  return (
    data.roadAddressEnglish ||
    data.addressEnglish ||
    data.jibunAddressEnglish ||
    data.autoRoadAddressEnglish ||
    data.autoJibunAddressEnglish ||
    ""
  ).trim();
}

function parseEnglishAddressParts(address: string) {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !/^(Republic of Korea|South Korea)$/i.test(part));
  const administrativeParts = parts.slice(1);

  return {
    district: administrativeParts[0] ?? "",
    city: administrativeParts[1] ?? administrativeParts[0] ?? "",
  };
}

function ClearableInput({
  label,
  value,
  placeholder,
  onChange,
  readOnly = false,
  trailing,
  type = "text",
  inputMode,
  inputRef,
  error,
}: {
  label: React.ReactNode;
  value: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  trailing?: React.ReactNode;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  inputRef?: React.Ref<HTMLInputElement>;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-base text-foreground">{label}</label>
      <div
        className={`relative mt-[6px] overflow-hidden rounded-2xl border bg-background ${
          error ? "border-destructive" : "border-border"
        }`}
      >
        <input
          ref={inputRef}
          type={type}
          inputMode={inputMode}
          value={value}
          readOnly={readOnly}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className={`h-16 w-full bg-transparent px-5 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none ${
            trailing ? "pr-16" : "pr-5"
          } ${readOnly ? "text-right" : ""}`}
        />
        {trailing ? (
          <div className="absolute inset-y-0 right-4 flex items-center">{trailing}</div>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function Step04TransferSenderInfo() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const detailAddressInputRef = useRef<HTMLInputElement>(null);
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
  const [isPhoneCountryCodeSheetOpen, setPhoneCountryCodeSheetOpen] = useState(false);
  const [addressSearchError, setAddressSearchError] = useState("");
  const isSenderNameValid = isValidEnglishName(senderName);
  const isPhoneNumberValid = isValidPhoneNumber(phoneNumber);
  const senderNameError =
    senderName.trim().length > 0 && !isSenderNameValid
      ? t("globalTransfer.senderInfo.nameError")
      : "";
  const phoneNumberError =
    phoneNumber.trim().length > 0 && !isPhoneNumberValid
      ? t("globalTransfer.senderInfo.phoneError")
      : "";

  useEffect(() => {
    if (!senderName && profile?.name && isValidEnglishName(profile.name)) {
      setSenderName(profile.name);
    }
  }, [profile?.name, senderName, setSenderName]);

  const selectedCountry = useMemo(
    () => transferCountries.find((item) => item.id === countryId) ?? transferCountries[0],
    [countryId]
  );
  const canProceed =
    isSenderNameValid &&
    isPhoneNumberValid &&
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

  const openAddressSearch = async () => {
    try {
      setAddressSearchError("");
      await loadKakaoPostcodeScript();

      new window.kakao!.Postcode({
        oncomplete: (data) => {
          const englishAddress = resolveEnglishAddress(data);
          const nextAddress = englishAddress || data.roadAddress || data.jibunAddress;
          const parsedAddress = parseEnglishAddressParts(englishAddress);

          setAddress(nextAddress);
          setPostalCode(data.zonecode);
          if (parsedAddress.district) {
            setDistrict(parsedAddress.district);
          }
          if (parsedAddress.city) {
            setCity(parsedAddress.city);
          }
          window.setTimeout(() => detailAddressInputRef.current?.focus(), 0);
        },
      }).open();
    } catch {
      setAddressSearchError(t("globalTransfer.senderInfo.addressSearchError"));
    }
  };

  return (
    <>
      <MobileLayout
        title={t("globalTransfer.title")}
        backPath="/global-transfer/send/step-03"
        bottomContent={
          isPhoneCountryCodeSheetOpen ? undefined : (
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
          )
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
              error={senderNameError}
            />

            <PhoneNumberField
              label={
                <>
                  {t("globalTransfer.senderInfo.phoneLabel")}
                  <CircleHelp className="h-5 w-5 text-muted-foreground" />
                </>
              }
              value={phoneNumber}
              onChange={setPhoneNumber}
              placeholder={t("globalTransfer.senderInfo.phonePlaceholder")}
              defaultDialCode={getDialCodeByCountryId(countryId)}
              countryCodeAriaLabel={t("globalTransfer.senderInfo.countryCodeAria")}
              error={phoneNumberError}
              clearAriaLabel={t("globalTransfer.senderInfo.clearAria")}
              onCountryCodeSheetOpenChange={setPhoneCountryCodeSheetOpen}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-base text-foreground">
                  {t("globalTransfer.senderInfo.addressLabel")}
                </label>
                <AppButton
                  type="button"
                  variant="unstyled"
                  onClick={openAddressSearch}
                  className="flex items-center gap-1 text-base font-medium text-primary"
                >
                  {t("globalTransfer.senderInfo.addressSearch")}
                  <Search className="h-4 w-4" />
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
              {addressSearchError ? (
                <p className="text-sm text-destructive">{addressSearchError}</p>
              ) : null}
            </div>

            <ClearableInput
              label={t("globalTransfer.senderInfo.detailLabel")}
              value={detailAddress}
              onChange={setDetailAddress}
              inputRef={detailAddressInputRef}
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
