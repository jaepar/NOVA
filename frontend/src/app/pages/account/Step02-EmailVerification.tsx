import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { EmailVerificationFields } from "../../components/email/EmailVerificationFields";
import { useEmailVerification } from "../../components/email/useEmailVerification";
import { SignupContent } from "../signup/components/SignupContent";

export function Step02EmailVerification() {
  const navigate = useNavigate();
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
      title="본인확인"
      backPath="/account/step-01"
      bottomContent={
        <Btn_1Col disabled={!isEmailVerified} onClick={() => navigate("/account/step-03")}>
          다음
        </Btn_1Col>
      }
    >
      <SignupContent className="pt-2">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold leading-tight">이메일 인증을 시작할게요</h2>
          <p className="text-sm text-muted-foreground">
            계좌 개설을 위해 이메일 인증을 진행해 주세요.
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
          codePlaceholder="인증번호 6자리를 입력해 주세요."
          codeHelperText="이메일로 전송된 인증번호를 입력해 주세요."
        />
      </SignupContent>
    </MobileLayout>
  );
}
