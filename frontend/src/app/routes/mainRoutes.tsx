import type { RouteObject } from "react-router-dom";
import { Home } from "../pages/Home";
import { Language } from "../pages/Language";
import { Landing } from "../pages/Landing";
import { Main } from "../pages/Main";
import { Transfer } from "../pages/Transfer";
import { Exchange } from "../pages/Exchange";
import { Notifications } from "../pages/Notifications";
import { TransactionHistory } from "../pages/TransactionHistory";
import { DesignSystem } from "../pages/DesignSystem";

export const mainRoutes: RouteObject[] = [
  { path: "/", Component: Home },
  { path: "/home", Component: Home },
  { path: "/language", Component: Language },
  { path: "/landing", Component: Landing },
  { path: "/main", Component: Main },
  { path: "/transfer", Component: Transfer },
  { path: "/exchange", Component: Exchange },
  { path: "/notifications", Component: Notifications },
  { path: "/transaction-history", Component: TransactionHistory },
  { path: "/design-system", Component: DesignSystem },
];
