import type { RouteObject } from "react-router-dom";
import { LoginIntro } from "../pages/login/LoginIntro";
import { LoginForm } from "../pages/login/LoginForm";

export const loginRoutes: RouteObject[] = [
  { path: "/login", Component: LoginIntro },
  { path: "/login/form", Component: LoginForm },
];
