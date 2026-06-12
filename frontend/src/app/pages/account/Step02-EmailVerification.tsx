import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { EmailVerificationFields } from "../../components/email/EmailVerificationFields";
import { useEmailVerification } from "../../components/email/useEmailVerification";
import { SignupContent } from "../signup/components/SignupContent";
import { useTranslation } from "../../i18n";

export function Step02EmailVerification() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const {
    isCodeSent,
    isSendingCode,
    isVerifying,
    isEmailVerified,
    resendSeconds,
    errorMessage,
    isEmailValid,
    canRequestInitialCode,
    canResend,
    handleEmailChange,
    handleVerificationCodeChange,
    handleSendVerification,
  } = useEmailVerification({
    email,
    verificationCode,
    setEmail,
    setVerificationCode,
  });

  return (
    <MobileLayout
      title={t("account.identityVerificationTitle")}
      titleKey="account.identityVerificationTitle"
      backPath="/account/step-01"
      bottomContent={
        <Btn_1Col disabled={!isEmailVerified} onClick={() => navigate("/account/step-03")}>
          {t("account.next")}
        </Btn_1Col>
      }
    >
      <SignupContent className="pt-2">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold leading-tight">
            {t("account.emailVerification.heading")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("account.emailVerification.description")}
          </p>
        </section>

        <EmailVerificationFields
          email={email}
          verificationCode={verificationCode}
          isCodeSent={isCodeSent}
          isSendingCode={isSendingCode}
          isVerifying={isVerifying}
          isEmailVerified={isEmailVerified}
          resendSeconds={resendSeconds}
          errorMessage={errorMessage}
          isEmailValid={isEmailValid}
          canRequestInitialCode={canRequestInitialCode}
          canResend={canResend}
          onEmailChange={handleEmailChange}
          onVerificationCodeChange={handleVerificationCodeChange}
          onSendVerification={handleSendVerification}
          codePlaceholder={t("signup.codePlaceholder")}
          codeHelperText={t("account.emailVerification.codeHelper")}
        />
      </SignupContent>
    </MobileLayout>
  );
}
