import { useCallback, useEffect, useMemo, useState } from "react";
import {
  emailVerificationApi,
  getEmailVerificationApiErrorMessage,
} from "../../../api";

const DEFAULT_RESEND_SECONDS = 60;

interface UseEmailVerificationOptions {
  email: string;
  verificationCode: string;
  setEmail: (value: string) => void;
  setVerificationCode: (value: string) => void;
  resendSeconds?: number;
  isReadyToSend?: boolean;
  onVerifiedChange?: (verified: boolean) => void;
}

export function formatEmailVerificationTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

export function useEmailVerification({
  email,
  verificationCode,
  setEmail,
  setVerificationCode,
  resendSeconds: resendLimit = DEFAULT_RESEND_SECONDS,
  isReadyToSend = true,
  onVerifiedChange,
}: UseEmailVerificationOptions) {
  const [isCodeSent, setCodeSent] = useState(false);
  const [isSendingCode, setSendingCode] = useState(false);
  const [isVerifying, setVerifying] = useState(false);
  const [isEmailVerified, setEmailVerified] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const canSendCode = isReadyToSend && isEmailValid && !isSendingCode && !isEmailVerified;
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
        await emailVerificationApi.confirm(email, verificationCode);

        if (!isCurrentRequest) {
          return;
        }

        setEmailVerified(true);
        onVerifiedChange?.(true);
      } catch (error) {
        if (isCurrentRequest) {
          setEmailVerified(false);
          onVerifiedChange?.(false);
          setErrorMessage(getEmailVerificationApiErrorMessage(error));
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
  }, [email, isCodeSent, isEmailVerified, onVerifiedChange, verificationCode]);

  const resetVerificationState = useCallback(() => {
    setCodeSent(false);
    setEmailVerified(false);
    setResendSeconds(0);
    setErrorMessage("");
    setVerificationCode("");
    onVerifiedChange?.(false);
  }, [onVerifiedChange, setVerificationCode]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    resetVerificationState();
  };

  const handleVerificationCodeChange = (value: string) => {
    const nextCode = value.replace(/\D/g, "").slice(0, 6);

    setVerificationCode(nextCode);
    setEmailVerified(false);
    onVerifiedChange?.(false);
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
      setCodeSent(true);
      setEmailVerified(false);
      onVerifiedChange?.(false);
      setVerificationCode("");
      setResendSeconds(resendLimit);
    } catch (error) {
      setCodeSent(false);
      setEmailVerified(false);
      onVerifiedChange?.(false);
      setErrorMessage(getEmailVerificationApiErrorMessage(error));
    } finally {
      setSendingCode(false);
    }
  };

  return {
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
    resetVerificationState,
  };
}
