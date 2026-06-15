import { useEffect, useMemo, useState } from "react";
import { BadgeInfo, IdCard, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { EmailVerificationFields } from "../../components/email/EmailVerificationFields";
import { useEmailVerification } from "../../components/email/useEmailVerification";
import { useTransferSendPageStore } from "../../stores/pageStores";
import { useTranslation } from "../../i18n";

function TransferVerificationHero() {
  const { t } = useTranslation();

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#E6EEF9] bg-[linear-gradient(135deg,#F8FBFF_0%,#EEF5FF_100%)] px-5 py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <h2 className="text-[20px] font-semibold leading-8 text-[#132347]">
            {t("globalTransfer.verification.heading")}
          </h2>
          <p className="whitespace-pre-line text-sm leading-7 text-[#4E5E78]">
            {t("globalTransfer.verification.description")}
          </p>
        </div>

        <div className="relative -mr-1 mt-2 flex h-[104px] w-[96px] shrink-0 items-center justify-center self-end">
          <div className="absolute inset-x-1 bottom-2 top-3 rounded-[24px] bg-white/75 shadow-[0_14px_30px_rgba(27,111,255,0.12)]" />
          <div className="relative flex h-[76px] w-[76px] items-center justify-center rounded-[22px] border border-[#D7E6FF] bg-[linear-gradient(180deg,#FFFFFF_0%,#EEF5FF_100%)] text-[#2476F2]">
            <IdCard className="h-10 w-10" strokeWidth={1.7} />
          </div>
          <div className="absolute bottom-3 right-1 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[#F3F8FF] bg-[#1B6FFF] text-white shadow-[0_10px_20px_rgba(27,111,255,0.22)]">
            <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={2.3} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function TransferInitialVerification() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isInitialVerificationComplete = useTransferSendPageStore(
    (state) => state.isInitialVerificationComplete
  );
  const completeInitialVerification = useTransferSendPageStore(
    (state) => state.completeInitialVerification
  );

  const [registrationFront, setRegistrationFront] = useState("");
  const [registrationBack, setRegistrationBack] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailVerified, setEmailVerified] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<
    "idle" | "validating" | "verified" | "failed"
  >("idle");
  const [lastValidatedRegistrationNumber, setLastValidatedRegistrationNumber] = useState("");

  const registrationNumber = useMemo(
    () => `${registrationFront}${registrationBack}`,
    [registrationBack, registrationFront]
  );
  const isRegistrationNumberValid =
    registrationFront.length === 6 && registrationBack.length === 7;
  const isRegistrationVerified = registrationStatus === "verified";
  const canCompleteVerification = isRegistrationVerified && isEmailVerified;
  const {
    isCodeSent,
    isSendingCode,
    isVerifying,
    resendSeconds,
    errorMessage,
    isEmailValid,
    canRequestInitialCode,
    canResend,
    handleEmailChange,
    handleVerificationCodeChange,
    handleSendVerification,
    resetVerificationState,
  } = useEmailVerification({
    email,
    verificationCode,
    setEmail,
    setVerificationCode,
    resendSeconds: 180,
    isReadyToSend: isRegistrationVerified,
    onVerifiedChange: setEmailVerified,
  });

  useEffect(() => {
    if (isInitialVerificationComplete) {
      navigate("/global-transfer/send/step-01", { replace: true });
    }
  }, [isInitialVerificationComplete, navigate]);

  const handleRegistrationFrontChange = (value: string) => {
    setRegistrationFront(value.replace(/\D/g, "").slice(0, 6));
  };

  const handleRegistrationBackChange = (value: string) => {
    setRegistrationBack(value.replace(/\D/g, "").slice(0, 7));
  };

  useEffect(() => {
    if (!isRegistrationNumberValid) {
      setRegistrationStatus("idle");
      setLastValidatedRegistrationNumber("");
      resetVerificationState();
      setEmail("");
      setVerificationCode("");
      return;
    }

    if (
      registrationNumber === lastValidatedRegistrationNumber &&
      isRegistrationVerified
    ) {
      return;
    }

    setRegistrationStatus("validating");
    resetVerificationState();
    setEmail("");
    setVerificationCode("");

    const timerId = window.setTimeout(() => {
      setRegistrationStatus("verified");
      setLastValidatedRegistrationNumber(registrationNumber);
    }, 500);

    return () => window.clearTimeout(timerId);
  }, [
    isRegistrationNumberValid,
    isRegistrationVerified,
    lastValidatedRegistrationNumber,
    registrationNumber,
    resetVerificationState,
  ]);

  const registrationHelperMessage =
    registrationStatus === "validating"
      ? t("globalTransfer.verification.registrationChecking")
      : registrationStatus === "verified"
      ? t("globalTransfer.verification.registrationVerified")
      : registrationStatus === "failed"
      ? t("globalTransfer.verification.registrationFailed")
      : t("globalTransfer.verification.registrationHint");

  const handleCompleteVerification = () => {
    completeInitialVerification();
    navigate("/global-transfer/send/step-01");
  };

  return (
    <MobileLayout
      title={t("globalTransfer.title")}
      headerType="back"
      backPath="/global-transfer"
      bottomContent={
        <Btn_1Col disabled={!canCompleteVerification} onClick={handleCompleteVerification}>
          {t("globalTransfer.verification.verifyButton")}
        </Btn_1Col>
      }
    >
      <div className="space-y-10 pb-4 pt-3">
        <TransferVerificationHero />

        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B6FFF] text-sm font-semibold text-white">
              1
            </div>
            <h2 className="text-[18px] font-semibold text-[#132347]">
              {t("globalTransfer.verification.registrationSection")}
            </h2>
          </div>

          <div className="space-y-2">
            <label className="block text-foreground">
              {t("globalTransfer.verification.registrationLabel")}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={registrationFront}
                onChange={(event) => handleRegistrationFrontChange(event.target.value)}
                disabled={isRegistrationVerified}
                className="h-16 min-w-0 flex-1 rounded-2xl border border-border bg-background px-5 text-lg text-[#132347] placeholder:text-[#B6C0D1] focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-[#F7F9FC] disabled:text-[#8A94A6]"
                style={{ fontSize: "16px" }}
              />
              <span className="text-xl font-semibold text-[#90A0B8]">-</span>
              <input
                type="password"
                inputMode="numeric"
                placeholder="0000000"
                value={registrationBack}
                onChange={(event) => handleRegistrationBackChange(event.target.value)}
                disabled={isRegistrationVerified}
                className="h-16 min-w-0 flex-1 rounded-2xl border border-border bg-background px-5 text-lg tracking-[0.25em] text-[#132347] placeholder:tracking-normal placeholder:text-[#B6C0D1] focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-[#F7F9FC] disabled:text-[#8A94A6]"
                style={{ fontSize: "16px" }}
              />
            </div>
            <p className={`text-sm ${isRegistrationVerified ? "text-primary" : "text-[#8A94A6]"}`}>
              {registrationHelperMessage}
            </p>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B6FFF] text-sm font-semibold text-white">
              2
            </div>
            <h2 className="text-[18px] font-semibold text-[#132347]">
              {t("globalTransfer.verification.emailSection")}
            </h2>
          </div>

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
            emailLabel={t("globalTransfer.verification.emailLabel")}
            emailPlaceholder={t("globalTransfer.verification.emailPlaceholder")}
            codeLabel={t("globalTransfer.verification.codeLabel")}
            codePlaceholder={t("globalTransfer.verification.codePlaceholder")}
            codeHelperText={
              isRegistrationVerified
                ? undefined
                : t("globalTransfer.verification.codeHelperText")
            }
            disabled={!isRegistrationVerified}
          />
        </section>

        <section className="rounded-[24px] bg-[#F6F8FC] px-5 py-6">
          <div className="flex gap-4">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#94A3B8]">
              <BadgeInfo className="h-5 w-5" />
            </div>
            <ul className="space-y-3 text-sm leading-6 text-[#5A6780]">
              <li>{t("globalTransfer.verification.guide1")}</li>
              <li>{t("globalTransfer.verification.guide2")}</li>
              <li>{t("globalTransfer.verification.guide3")}</li>
            </ul>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}
