import type { RouteObject } from "react-router-dom";
import { Login as LoginIntro } from "../pages/Login";
import { Login as LoginForm } from "../pages/login/Login";

export const loginRoutes: RouteObject[] = [
  { path: "/login", Component: LoginIntro },
  { path: "/login/form", Component: LoginForm },
];
