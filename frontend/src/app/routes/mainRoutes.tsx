import type { RouteObject } from "react-router-dom";
import { EntryRedirect } from "../pages/EntryRedirect";
import { Home } from "../pages/Home";
import { Language } from "../pages/Language";
import { Landing } from "../pages/Landing";
import { Main } from "../pages/Main";
import { HospitalChatPage } from "../pages/main/HospitalChatPage";
import { Exchange } from "../pages/Exchange";
import { Notifications } from "../pages/Notifications";
import { DesignSystem } from "../pages/DesignSystem";

export const mainRoutes: RouteObject[] = [
  { path: "/", Component: EntryRedirect },
  { path: "/home", Component: Home },
  { path: "/language", Component: Language },
  { path: "/landing", Component: Landing },
  { path: "/main", Component: Main },
  { path: "/hospital-chat", Component: HospitalChatPage },
  { path: "/exchange", Component: Exchange },
  { path: "/notifications", Component: Notifications },
  { path: "/design-system", Component: DesignSystem },
];
