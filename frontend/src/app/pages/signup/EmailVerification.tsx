import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { AppButton } from "../../components/design-system/AppButton";
import {
  emailVerificationApi,
  getEmailVerificationApiErrorMessage,
} from "../../../api";
import { useSignupPageStore } from "../../stores/pageStores";
import { SignupContent } from "./components/SignupContent";
import { SignupInputGroup } from "./components/SignupInputGroup";

const verificationExpiresSeconds = 5 * 60;

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
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const canSendCode = isEmailValid && !isSendingCode && !isVerifying;
  const canContinue =
    isCodeSent &&
    remainingSeconds > 0 &&
    verificationCode.length === 6 &&
    !isSendingCode &&
    !isVerifying;

  useEffect(() => {
    if (!isCodeSent || remainingSeconds === 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isCodeSent, remainingSeconds]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setVerificationCode("");
    setCodeSent(false);
    setRemainingSeconds(0);
    setErrorMessage("");
  };

  const handleVerificationCodeChange = (value: string) => {
    setVerificationCode(value.replace(/\D/g, "").slice(0, 6));
    setErrorMessage("");
  };

  const handleSendVerification = async () => {
    if (!canSendCode) {
      return;
    }

    setSendingCode(true);
    setErrorMessage("");

    try {
      await emailVerificationApi.send(email);
      setVerificationCode("");
      setCodeSent(true);
      setRemainingSeconds(verificationExpiresSeconds);
    } catch (error) {
      setErrorMessage(getEmailVerificationApiErrorMessage(error));
    } finally {
      setSendingCode(false);
    }
  };

  const handleConfirmVerification = async () => {
    if (!canContinue) {
      return;
    }

    setVerifying(true);
    setErrorMessage("");

    try {
      await emailVerificationApi.confirm(email, verificationCode);
      navigate("/signup/personal-info");
    } catch (error) {
      setErrorMessage(getEmailVerificationApiErrorMessage(error));
    } finally {
      setVerifying(false);
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
        <Btn_1Col onClick={handleConfirmVerification} disabled={!canContinue}>
          {isVerifying ? "확인 중" : "다음"}
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
              disabled={isSendingCode || isVerifying}
              autoComplete="email"
              rightContent={
                <AppButton
                  type="button"
                  variant="unstyled"
                  onClick={handleSendVerification}
                  disabled={!canSendCode}
                  className="text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:text-muted-foreground"
                >
                  {isSendingCode ? "발송 중" : isCodeSent ? "재발송" : "인증번호 받기"}
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
              disabled={!isCodeSent || isSendingCode || isVerifying}
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
            />
            {isCodeSent && remainingSeconds > 0 && (
              <p className="text-sm font-medium text-red-500">
                남은 시간 {formatTimer(remainingSeconds)}
              </p>
            )}
            {isCodeSent && remainingSeconds === 0 && (
              <p className="text-sm text-red-500">
                인증 시간이 만료되었습니다. 인증번호를 다시 받아주세요.
              </p>
            )}
            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
          </div>
        </section>
      </SignupContent>
    </MobileLayout>
  );
}
