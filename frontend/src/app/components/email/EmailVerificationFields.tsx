import { AppButton } from "../design-system/AppButton";
import { SignupInputGroup } from "../../pages/signup/components/SignupInputGroup";
import { formatEmailVerificationTimer } from "./useEmailVerification";

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
  emailLabel = "이메일",
  emailPlaceholder = "example@email.com",
  codeLabel = "인증번호",
  codePlaceholder = "인증번호 6자리를 입력해주세요",
  emailAutoComplete = "email",
  codeHelperText,
  className = "",
  disabled = false,
}: EmailVerificationFieldsProps) {
  return (
    <section className={`space-y-6 ${className}`.trim()}>
      <div className="space-y-2">
        <SignupInputGroup
          label={emailLabel}
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
              {isSendingCode ? "발송 중" : "인증번호 받기"}
            </AppButton>
          }
        />
        {email && !isEmailValid && (
          <p className="text-sm text-red-500">올바른 이메일 형식을 입력해주세요.</p>
        )}
        {isCodeSent && (
          <p className="text-sm text-muted-foreground">인증번호가 발송되었습니다.</p>
        )}
      </div>

      <div className="space-y-2">
        <SignupInputGroup
          label={codeLabel}
          placeholder={codePlaceholder}
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
              ? `재전송 (${formatEmailVerificationTimer(resendSeconds)})`
              : "재전송"}
          </AppButton>
        )}
        {isVerifying && (
          <p className="text-sm text-muted-foreground">인증번호를 확인하고 있습니다.</p>
        )}
        {isEmailVerified && (
          <p className="text-sm text-primary">이메일 인증이 완료되었습니다.</p>
        )}
        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      </div>
    </section>
  );
}
