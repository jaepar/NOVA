import type { RouteObject } from "react-router-dom";
import {
  WalletCharge,
  WalletHome,
  WalletPayment,
  WalletSplash,
  WalletTerms,
} from "../pages/wallet";

export const walletRoutes: RouteObject[] = [
  { path: "/wallet", Component: WalletSplash },
  { path: "/wallet/terms", Component: WalletTerms },
  { path: "/wallet/home", Component: WalletHome },
  { path: "/wallet/charge", Component: WalletCharge },
  { path: "/wallet/payment", Component: WalletPayment },
];
