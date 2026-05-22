import type { RouteObject } from "react-router-dom";
import { Home } from "../pages/Home";
import { Language } from "../pages/Language";
import { Landing } from "../pages/Landing";
import { Main } from "../pages/Main";
import { Login } from "../pages/Login";
import { Transfer } from "../pages/Transfer";
import { Exchange } from "../pages/Exchange";
import { MyPage } from "../pages/MyPage";
import { Notifications } from "../pages/Notifications";
import { TransactionHistory } from "../pages/TransactionHistory";
import { DesignSystem } from "../pages/DesignSystem";

export const mainRoutes: RouteObject[] = [
  { path: "/", Component: Home },
  { path: "/home", Component: Home },
  { path: "/language", Component: Language },
  { path: "/landing", Component: Landing },
  { path: "/main", Component: Main },
  { path: "/login", Component: Login },
  { path: "/transfer", Component: Transfer },
  { path: "/exchange", Component: Exchange },
  { path: "/mypage", Component: MyPage },
  { path: "/notifications", Component: Notifications },
  { path: "/transaction-history", Component: TransactionHistory },
  { path: "/design-system", Component: DesignSystem },
];
