import { AppButton } from "../design-system/AppButton";
import { SignupInputGroup } from "../../pages/signup/components/SignupInputGroup";
import { formatEmailVerificationTimer } from "./useEmailVerification";
import { useTranslation } from "../../i18n";

interface EmailVerificationFieldsProps {
  email: string;
  verificationCode: string;
  isCodeSent: boolean;
  isSendingCode: boolean;
  isVerifying: boolean;
  isEmailVerified: boolean;
  resendSeconds: number;
  errorMessage: string;
  isEmailValid: boolean;
  canRequestInitialCode: boolean;
  canResend: boolean;
  onEmailChange: (value: string) => void;
  onVerificationCodeChange: (value: string) => void;
  onSendVerification: () => void;
  emailLabel?: string;
  emailPlaceholder?: string;
  codeLabel?: string;
  codePlaceholder?: string;
  emailAutoComplete?: string;
  codeHelperText?: string;
  className?: string;
  disabled?: boolean;
}

export function EmailVerificationFields({
  email,
  verificationCode,
  isCodeSent,
  isSendingCode,
  isVerifying,
  isEmailVerified,
  resendSeconds,
  errorMessage,
  isEmailValid,
  canRequestInitialCode,
  canResend,
  onEmailChange,
  onVerificationCodeChange,
  onSendVerification,
  emailLabel,
  emailPlaceholder = "example@email.com",
  codeLabel,
  codePlaceholder,
  emailAutoComplete = "email",
  codeHelperText,
  className = "",
  disabled = false,
}: EmailVerificationFieldsProps) {
  const { t } = useTranslation();
  const resolvedEmailLabel = emailLabel ?? t("signup.email");
  const resolvedCodeLabel = codeLabel ?? t("signup.code");
  const resolvedCodePlaceholder =
    codePlaceholder ?? t("signup.codePlaceholder");

  return (
    <section className={`space-y-6 ${className}`.trim()}>
      <div className="space-y-2">
        <SignupInputGroup
          label={resolvedEmailLabel}
          type="email"
          placeholder={emailPlaceholder}
          value={email}
          onChange={onEmailChange}
          disabled={disabled}
          autoComplete={emailAutoComplete}
          rightContent={
            <AppButton
              type="button"
              variant="unstyled"
              onClick={onSendVerification}
              disabled={disabled || !canRequestInitialCode}
              className="text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:text-muted-foreground"
            >
              {isSendingCode
                ? t("signup.sending")
                : t("signup.getCode")}
            </AppButton>
          }
        />
        {email && !isEmailValid && (
          <p className="text-sm text-red-500">
            {t("signup.invalidEmail")}
          </p>
        )}
        {isCodeSent && (
          <p className="text-sm text-muted-foreground">
            {t("signup.codeSent")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <SignupInputGroup
          label={resolvedCodeLabel}
          placeholder={resolvedCodePlaceholder}
          value={verificationCode}
          onChange={onVerificationCodeChange}
          disabled={disabled || !isCodeSent || isEmailVerified}
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
        />
        {codeHelperText && <p className="text-sm text-muted-foreground">{codeHelperText}</p>}
        {isCodeSent && (
          <AppButton
            type="button"
            variant="unstyled"
            onClick={onSendVerification}
            disabled={disabled || !canResend}
            className="text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:text-muted-foreground"
          >
            {resendSeconds > 0
              ? `${t("signup.resend")} (${formatEmailVerificationTimer(resendSeconds)})`
              : t("signup.resend")}
          </AppButton>
        )}
        {isVerifying && (
          <p className="text-sm text-muted-foreground">
            {t("signup.verifying")}
          </p>
        )}
        {isEmailVerified && (
          <p className="text-sm text-primary">
            {t("signup.emailVerified")}
          </p>
        )}
        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      </div>
    </section>
  );
}
