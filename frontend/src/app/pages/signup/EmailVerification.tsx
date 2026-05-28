import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { AppButton } from "../../components/design-system/AppButton";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { useSignupPageStore } from "../../stores/pageStores";
import { SignupContent } from "./components/SignupContent";
import { SignupInputGroup } from "./components/SignupInputGroup";
import { confirmEmailVerification, sendEmailVerification } from "./emailVerificationApi";

const RESEND_SECONDS = 60;

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

export function EmailVerification() {
  const navigate = useNavigate();
  const email = useSignupPageStore((state) => state.email);
  const verificationCode = useSignupPageStore((state) => state.verificationCode);
  const setEmail = useSignupPageStore((state) => state.setEmail);
  const setVerificationCode = useSignupPageStore((state) => state.setVerificationCode);
  const resetSignup = useSignupPageStore((state) => state.resetSignup);
  const [isCodeSent, setCodeSent] = useState(false);
  const [isSendingCode, setSendingCode] = useState(false);
  const [isVerifying, setVerifying] = useState(false);
  const [isEmailVerified, setEmailVerified] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const canSendCode = isEmailValid && !isSendingCode && !isEmailVerified;
  const canRequestInitialCode = canSendCode && !isCodeSent;
  const canResend = isCodeSent && resendSeconds === 0 && !isSendingCode && !isEmailVerified;

  useEffect(() => {
    if (!isCodeSent || resendSeconds === 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setResendSeconds((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isCodeSent, resendSeconds]);

  useEffect(() => {
    if (!isCodeSent || isEmailVerified || verificationCode.length !== 6) {
      return;
    }

    let isCurrentRequest = true;

    async function verifyCode() {
      setVerifying(true);
      setErrorMessage("");

      try {
        const response = await confirmEmailVerification(email, verificationCode);

        if (!isCurrentRequest) {
          return;
        }

        if (response.verified === false) {
          setEmailVerified(false);
          setErrorMessage("인증번호가 일치하지 않습니다.");
          return;
        }

        setEmailVerified(true);
      } catch {
        if (isCurrentRequest) {
          setEmailVerified(false);
          setErrorMessage("인증번호를 확인할 수 없습니다. 다시 입력해주세요.");
        }
      } finally {
        if (isCurrentRequest) {
          setVerifying(false);
        }
      }
    }

    verifyCode();

    return () => {
      isCurrentRequest = false;
    };
  }, [email, isCodeSent, isEmailVerified, verificationCode]);

  const resetVerificationState = () => {
    setCodeSent(false);
    setEmailVerified(false);
    setResendSeconds(0);
    setErrorMessage("");
    setVerificationCode("");
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    resetVerificationState();
  };

  const handleVerificationCodeChange = (value: string) => {
    const nextCode = value.replace(/\D/g, "").slice(0, 6);

    setVerificationCode(nextCode);
    setEmailVerified(false);
    setErrorMessage("");
  };

  const handleSendVerification = async () => {
    if (!canSendCode) {
      return;
    }

    setSendingCode(true);
    setErrorMessage("");

    try {
      await sendEmailVerification(email);
      setCodeSent(true);
      setEmailVerified(false);
      setVerificationCode("");
      setResendSeconds(RESEND_SECONDS);
    } catch {
      setCodeSent(false);
      setEmailVerified(false);
      setErrorMessage("인증번호를 발송할 수 없습니다. 다시 시도해주세요.");
    } finally {
      setSendingCode(false);
    }
  };

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

        <section className="space-y-6">
          <div className="space-y-2">
            <SignupInputGroup
              label="이메일"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={handleEmailChange}
              autoComplete="email"
              rightContent={
                <AppButton
                  type="button"
                  variant="unstyled"
                  onClick={handleSendVerification}
                  disabled={!canRequestInitialCode}
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
              label="인증번호"
              placeholder="인증번호 6자리를 입력해주세요"
              value={verificationCode}
              onChange={handleVerificationCodeChange}
              disabled={!isCodeSent || isEmailVerified}
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
            />
            {isCodeSent && (
              <AppButton
                type="button"
                variant="unstyled"
                onClick={handleSendVerification}
                disabled={!canResend}
                className="text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:text-muted-foreground"
              >
                {resendSeconds > 0 ? `재전송 (${formatTimer(resendSeconds)})` : "재전송"}
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
      </SignupContent>
    </MobileLayout>
  );
}
