import { useEffect, useMemo, useState } from "react";
import { BadgeInfo, CreditCard, Mail, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { EmailVerificationFields } from "../../components/email/EmailVerificationFields";
import { useEmailVerification } from "../../components/email/useEmailVerification";
import { useTransferSendPageStore } from "../../stores/pageStores";

function TransferVerificationHero() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[#E6EEF9] bg-[linear-gradient(135deg,#F8FBFF_0%,#EEF5FF_100%)] p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-3">
          <h2 className="text-[20px] font-semibold leading-8 text-[#132347]">
            최초 1회 인증이 필요해요
          </h2>
          <p className="text-sm leading-7 text-[#4E5E78]">
            안전한 해외송금을 위해
            <br />
            외국인등록증 번호와 이메일 인증을 진행해주세요.
          </p>
        </div>

        <div className="relative shrink-0">
          <div className="flex h-28 w-28 items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#DCEAFE_0%,#F3F8FF_100%)] text-[#3B82F6]">
            <CreditCard className="h-14 w-14" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-2 -right-3 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(180deg,#4D99FF_0%,#1B6FFF_100%)] text-white shadow-[0_12px_24px_rgba(27,111,255,0.24)]">
            <ShieldCheck className="h-7 w-7" strokeWidth={2} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function TransferInitialVerification() {
  const navigate = useNavigate();
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

    if (registrationNumber === lastValidatedRegistrationNumber && isRegistrationVerified) {
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
      ? "등록번호를 확인하고 있습니다."
      : registrationStatus === "verified"
      ? "등록번호 확인이 완료되었습니다."
      : registrationStatus === "failed"
      ? "등록번호를 다시 확인해 주세요."
      : "숫자만 입력해 주세요.";

  const handleCompleteVerification = () => {
    completeInitialVerification();
    navigate("/global-transfer/send/step-01");
  };

  return (
    <MobileLayout
      title="해외송금"
      headerType="back"
      backPath="/global-transfer"
      bottomContent={
        <Btn_1Col disabled={!canCompleteVerification} onClick={handleCompleteVerification}>
          인증 완료
        </Btn_1Col>
      }
    >
      <div className="space-y-10 pt-3 pb-4">
        <TransferVerificationHero />

        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B6FFF] text-sm font-semibold text-white">
              1
            </div>
            <h2 className="text-[18px] font-semibold text-[#132347]">외국인등록증 번호 입력</h2>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#132347]">외국인등록증 번호</label>
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
            <p
              className={`text-sm ${
                isRegistrationVerified ? "text-primary" : "text-[#8A94A6]"
              }`}
            >
              {registrationHelperMessage}
            </p>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B6FFF] text-sm font-semibold text-white">
              2
            </div>
            <h2 className="text-[18px] font-semibold text-[#132347]">이메일 인증</h2>
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
            emailLabel="이메일 주소"
            emailPlaceholder="이메일 주소 입력"
            codeLabel="인증번호 입력"
            codePlaceholder="인증번호 6자리 입력"
            codeHelperText={
              isRegistrationVerified
                ? undefined
                : "등록번호 확인이 완료되면 이메일 인증을 진행할 수 있습니다."
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
              <li>최초 1회만 인증하면 됩니다.</li>
              <li>인증 완료 후 해외송금을 이용할 수 있습니다.</li>
              <li>입력한 정보는 안전하게 암호화되어 처리됩니다.</li>
            </ul>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}
