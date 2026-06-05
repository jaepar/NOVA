import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { walletApi, type WalletNextStep } from "../../../api";
import { AppButton } from "../../components/design-system/AppButton";
import { BottomSheet } from "../../components/layout/BottomSheet";
import accountRequiredIcon from "./assets/account-required-icon.png";
import myWalletLogo from "./assets/my-wallet-logo.png";
import { walletPrimaryButtonClass, walletSecondaryButtonClass } from "./styles";

const LOGO_ONLY_DURATION_MS = 1500;
const HOME_TRANSITION_DURATION_MS = 500;

function isUnauthorizedError(error: unknown) {
  return error instanceof AxiosError && error.response?.status === 401;
}

export function WalletSplash() {
  const navigate = useNavigate();
  const [readyToStart, setReadyToStart] = useState(false);
  const [isAccountRequiredOpen, setIsAccountRequiredOpen] = useState(false);
  const [nextStep, setNextStep] = useState<WalletNextStep | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [isLoginRequired, setIsLoginRequired] = useState(false);
  const [isLeavingForHome, setIsLeavingForHome] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const timerId = window.setTimeout(() => {
      if (isMounted) {
        setReadyToStart(true);
      }
    }, LOGO_ONLY_DURATION_MS);

    const loadWalletStatus = async () => {
      try {
        const status = await walletApi.status();

        if (!isMounted) {
          return;
        }

        setStatusError(false);
        setIsLoginRequired(false);
        setNextStep(status.nextStep);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setStatusError(true);
        setIsLoginRequired(isUnauthorizedError(error));
        setNextStep(null);
      }
    };

    loadWalletStatus();

    return () => {
      isMounted = false;
      window.clearTimeout(timerId);
    };
  }, []);

  const retryWalletStatus = async () => {
    setStatusError(false);
    setIsLoginRequired(false);

    try {
      const status = await walletApi.status();

      setIsLoginRequired(false);
      setNextStep(status.nextStep);
    } catch (error) {
      setStatusError(true);
      setIsLoginRequired(isUnauthorizedError(error));
      setNextStep(null);
    }
  };

  useEffect(() => {
    if (!readyToStart || nextStep !== "WALLET_HOME") {
      return;
    }

    setIsLeavingForHome(true);

    const timerId = window.setTimeout(() => {
      navigate("/wallet/home", { replace: true });
    }, HOME_TRANSITION_DURATION_MS);

    return () => window.clearTimeout(timerId);
  }, [navigate, nextStep, readyToStart]);

  const handleStartWallet = () => {
    if (isLoginRequired) {
      navigate("/login");
      return;
    }

    if (statusError) {
      retryWalletStatus();
      return;
    }

    if (!nextStep) {
      return;
    }

    if (nextStep === "WALLET_TERMS") {
      navigate("/wallet/terms");
      return;
    }

    setIsAccountRequiredOpen(true);
  };

  const canStartWallet =
    readyToStart && (statusError || (nextStep !== null && nextStep !== "WALLET_HOME"));

  const handleCreateAccount = () => {
    setIsAccountRequiredOpen(false);
    navigate("/certificate/step-01");
  };

  const handleLater = () => {
    setIsAccountRequiredOpen(false);
    navigate("/main");
  };

  return (
    <main className="flex h-full w-full flex-col items-center justify-center bg-white px-5">
      <div
        className={`flex flex-col items-center transition-all duration-700 ease-out ${
          isLeavingForHome
            ? "-translate-y-16 scale-75 opacity-0"
            : canStartWallet
              ? "-translate-y-12 scale-75 opacity-100"
              : "scale-100 opacity-100"
        }`}
      >
        <img
          src={myWalletLogo}
          alt="MYWALLET"
          className="w-full max-w-[280px] animate-in fade-in zoom-in-95 duration-700 object-contain"
        />
      </div>

      <div
        className={`fixed bottom-0 left-0 right-0 z-40 w-full px-[20px] pb-[20px] pt-[5px] transition-all duration-500 ease-out ${
          canStartWallet
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-5 opacity-0"
        }`}
      >
        <AppButton
          type="button"
          variant="unstyled"
          onClick={handleStartWallet}
          disabled={!statusError && !nextStep}
          className={walletPrimaryButtonClass}
        >
          {isLoginRequired
            ? "NOVA 로그인 하러가기"
            : statusError
              ? "다시 시도"
              : !nextStep
                ? "확인 중"
                : "월렛 생성하기"}
        </AppButton>
      </div>

      <BottomSheet
        isOpen={isAccountRequiredOpen}
        onClose={() => setIsAccountRequiredOpen(false)}
        title=""
      >
        <div className="space-y-8 pb-2">
          <div className="space-y-4 text-center">
            <img
              src={accountRequiredIcon}
              alt=""
              aria-hidden="true"
              className="mx-auto mb-3 h-[132px] w-[132px] object-contain"
            />

            <h3 className="text-xl font-semibold leading-snug text-[#111111]">
              계좌 개설이 필요해요
            </h3>
            <p className="text-[15px] leading-relaxed text-[#666666]">
              월렛을 사용하려면
              <br />
              먼저 계좌를 개설해주세요.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AppButton
              type="button"
              variant="unstyled"
              onClick={handleLater}
              className={walletSecondaryButtonClass}
            >
              나중에
            </AppButton>
            <AppButton
              type="button"
              variant="unstyled"
              onClick={handleCreateAccount}
              className={walletPrimaryButtonClass}
            >
              계좌 개설하기
            </AppButton>
          </div>
        </div>
      </BottomSheet>
    </main>
  );
}
