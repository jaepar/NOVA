import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import myWalletLogo from "./assets/my-wallet-logo.png";

const LOGO_ONLY_DURATION_MS = 1500;

export function WalletSplash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      navigate("/wallet/terms", { replace: true });
    }, LOGO_ONLY_DURATION_MS);

    return () => window.clearTimeout(timerId);
  }, [navigate]);

  return (
    <main className="flex h-full w-full flex-col items-center justify-center bg-white px-10">
      <div className="flex animate-in fade-in zoom-in-95 duration-700 flex-col items-center">
        <img
          src={myWalletLogo}
          alt="MYWALLET"
          className="w-full max-w-[280px] animate-in fade-in zoom-in-95 duration-700 object-contain"
        />
      </div>
    </main>
  );
}
