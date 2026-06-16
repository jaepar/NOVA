import type { ReactNode } from "react";
import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { AppButton } from "../../components/design-system/AppButton";
import { BottomSheet } from "../../components/layout/BottomSheet";
import { TRANSFER_BOTTOM_SHEET_HEIGHT } from "../../components/transfer/transferSheetConfig";

const phoneCountryOptions = [
  { countryId: "kr", label: "Korea", dialCode: "+82" },
  { countryId: "us", label: "United States", dialCode: "+1" },
  { countryId: "jp", label: "Japan", dialCode: "+81" },
  { countryId: "cn", label: "China", dialCode: "+86" },
  { countryId: "vn", label: "Vietnam", dialCode: "+84" },
  { countryId: "ph", label: "Philippines", dialCode: "+63" },
  { countryId: "th", label: "Thailand", dialCode: "+66" },
  { countryId: "id", label: "Indonesia", dialCode: "+62" },
  { countryId: "in", label: "India", dialCode: "+91" },
  { countryId: "uz", label: "Uzbekistan", dialCode: "+998" },
  { countryId: "mn", label: "Mongolia", dialCode: "+976" },
];

const sortedPhoneCountryOptions = [...phoneCountryOptions].sort(
  (a, b) => b.dialCode.length - a.dialCode.length
);

export function getDialCodeByCountryId(countryId: string) {
  return (
    phoneCountryOptions.find((option) => option.countryId === countryId)?.dialCode ??
    phoneCountryOptions[0].dialCode
  );
}

function stripPhoneCharacters(value: string) {
  return value.replace(/[^\d\s\-()]/g, "");
}

function composePhoneNumber(dialCode: string, localNumber: string) {
  const cleanedLocalNumber = stripPhoneCharacters(localNumber).trim();

  return cleanedLocalNumber ? `${dialCode} ${cleanedLocalNumber}` : dialCode;
}

function parsePhoneNumber(value: string, defaultDialCode: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return { dialCode: defaultDialCode, localNumber: "" };
  }

  const matchedOption = sortedPhoneCountryOptions.find((option) =>
    trimmed.startsWith(option.dialCode)
  );

  if (!matchedOption) {
    return { dialCode: defaultDialCode, localNumber: stripPhoneCharacters(trimmed) };
  }

  return {
    dialCode: matchedOption.dialCode,
    localNumber: stripPhoneCharacters(trimmed.slice(matchedOption.dialCode.length).trim()),
  };
}

export function PhoneNumberField({
  label,
  value,
  onChange,
  placeholder,
  defaultDialCode = "+82",
  clearAriaLabel,
  countryCodeAriaLabel = "Country code",
  error,
  onCountryCodeSheetOpenChange,
}: {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  defaultDialCode?: string;
  clearAriaLabel: string;
  countryCodeAriaLabel?: string;
  error?: string;
  onCountryCodeSheetOpenChange?: (isOpen: boolean) => void;
}) {
  const [isCountryCodeSheetOpen, setCountryCodeSheetOpen] = useState(false);
  const { dialCode, localNumber } = parsePhoneNumber(value, defaultDialCode);

  const setCountryCodeSheetOpenState = (isOpen: boolean) => {
    setCountryCodeSheetOpen(isOpen);
    onCountryCodeSheetOpenChange?.(isOpen);
  };

  const closeCountryCodeSheet = () => {
    setCountryCodeSheetOpenState(false);
  };

  const handleDialCodeChange = (nextDialCode: string) => {
    onChange(composePhoneNumber(nextDialCode, localNumber));
  };

  const handleLocalNumberChange = (nextLocalNumber: string) => {
    onChange(composePhoneNumber(dialCode, nextLocalNumber));
  };

  return (
    <>
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-base text-foreground">{label}</label>
        <div className="mt-[6px] grid grid-cols-[104px_1fr] gap-3">
          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => setCountryCodeSheetOpenState(true)}
            aria-label={countryCodeAriaLabel}
            className="flex h-16 items-center justify-between rounded-2xl border border-border bg-background px-4 text-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <span>{dialCode}</span>
            <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
          </AppButton>

          <div
            className={`relative overflow-hidden rounded-2xl border bg-background ${
              error ? "border-destructive" : "border-border"
            }`}
          >
            <input
              type="text"
              inputMode="tel"
              value={localNumber}
              onChange={(event) => handleLocalNumberChange(event.target.value)}
              placeholder={placeholder}
              aria-invalid={Boolean(error)}
              className={`h-16 w-full bg-transparent px-5 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none ${
                localNumber ? "pr-16" : "pr-5"
              }`}
            />
            {localNumber ? (
              <div className="absolute inset-y-0 right-4 flex items-center">
                <AppButton
                  type="button"
                  variant="unstyled"
                  onClick={() => onChange("")}
                  className="rounded-full bg-muted p-1 text-muted-foreground"
                  aria-label={clearAriaLabel}
                >
                  <X className="h-4 w-4" />
                </AppButton>
              </div>
            ) : null}
          </div>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <BottomSheet
        isOpen={isCountryCodeSheetOpen}
        onClose={closeCountryCodeSheet}
        title=""
        height={TRANSFER_BOTTOM_SHEET_HEIGHT}
        disableScroll
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center justify-between pb-4">
            <p className="text-lg font-semibold text-foreground">{countryCodeAriaLabel}</p>
            <AppButton
              type="button"
              variant="unstyled"
              onClick={closeCountryCodeSheet}
              className="p-1 text-muted-foreground"
              aria-label={clearAriaLabel}
            >
              <X className="h-5 w-5" />
            </AppButton>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="divide-y divide-border rounded-2xl border border-border bg-background">
              {phoneCountryOptions.map((option) => {
                const isSelected = option.dialCode === dialCode;

                return (
                  <AppButton
                    key={option.countryId}
                    type="button"
                    variant="unstyled"
                    onClick={() => {
                      handleDialCodeChange(option.dialCode);
                      closeCountryCodeSheet();
                    }}
                    className="flex w-full items-center justify-between px-4 py-4 text-left text-foreground transition-colors hover:bg-secondary"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="w-14 shrink-0 text-lg font-semibold">
                        {option.dialCode}
                      </span>
                      <span className="truncate text-base text-muted-foreground">
                        {option.label}
                      </span>
                    </span>
                    {isSelected ? <Check className="h-5 w-5 shrink-0 text-primary" /> : null}
                  </AppButton>
                );
              })}
            </div>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
