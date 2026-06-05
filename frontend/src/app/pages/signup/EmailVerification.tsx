import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { EmailVerificationFields } from "../../components/email/EmailVerificationFields";
import { useEmailVerification } from "../../components/email/useEmailVerification";
import { useSignupPageStore } from "../../stores/pageStores";
import { SignupContent } from "./components/SignupContent";

export function EmailVerification() {
  const navigate = useNavigate();
  const email = useSignupPageStore((state) => state.email);
  const verificationCode = useSignupPageStore((state) => state.verificationCode);
  const setEmail = useSignupPageStore((state) => state.setEmail);
  const setVerificationCode = useSignupPageStore((state) => state.setVerificationCode);
  const resetSignup = useSignupPageStore((state) => state.resetSignup);
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

  const handleBack = () => {
    resetSignup();
    navigate("/main");
  };

  return (
    <MobileLayout
      title="회원가입"
      onBack={handleBack}
      bottomContent={
        <Btn_1Col onClick={() => navigate("/signup/personal-info")} disabled={!isEmailVerified}>
          다음
        </Btn_1Col>
      }
    >
      <SignupContent className="space-y-10">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold leading-tight">
            반가워요!
            <br />
            이메일 인증을 시작할게요
          </h2>
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
        />
      </SignupContent>
    </MobileLayout>
  );
}
