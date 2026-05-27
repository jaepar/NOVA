import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppButton } from "../../components/design-system/AppButton";
import myWalletLogo from "./assets/my-wallet-logo.png";

const LOGO_ONLY_DURATION_MS = 1500;

export function WalletSplash() {
  const navigate = useNavigate();
  const [readyToStart, setReadyToStart] = useState(false);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setReadyToStart(true);
    }, LOGO_ONLY_DURATION_MS);

    return () => window.clearTimeout(timerId);
  }, []);

  return (
    <main className="flex h-full w-full flex-col items-center justify-center bg-white px-5">
      <div
        className={`flex flex-col items-center transition-all duration-700 ease-out ${
          readyToStart ? "-translate-y-12 scale-75" : "scale-100"
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
          readyToStart
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-5 opacity-0"
        }`}
      >
        <AppButton
          type="button"
          variant="unstyled"
          onClick={() => navigate("/wallet/terms")}
          className="flex h-[56px] w-full items-center justify-center rounded-lg bg-black text-[17px] font-semibold text-white transition-colors disabled:opacity-40"
        >
          월렛 생성하기
        </AppButton>
      </div>
    </main>
  );
}
