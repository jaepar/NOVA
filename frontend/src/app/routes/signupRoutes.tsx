import type { RouteObject } from "react-router-dom";
import { EmailVerification } from "../pages/signup/EmailVerification";
import { PersonalInfo } from "../pages/signup/PersonalInfo";
import { Terms } from "../pages/signup/Terms";
import { PasswordSetup } from "../pages/signup/PasswordSetup";
import { Complete } from "../pages/signup/Complete";
import { ConsentDetail } from "../pages/signup/ConsentDetail";
import { ConsentCategoryCarousel } from "../pages/signup/ConsentCategoryCarousel";

export const signupRoutes: RouteObject[] = [
  { path: "/signup", Component: EmailVerification },
  { path: "/signup/personal-info", Component: PersonalInfo },
  { path: "/signup/terms", Component: Terms },
  { path: "/signup/terms/terms/:termId", Component: ConsentDetail },
  { path: "/signup/terms/categories/:categoryId/consent", Component: ConsentCategoryCarousel },
  { path: "/signup/terms/:termId", Component: ConsentDetail },
  { path: "/signup/categories/:categoryId/consent", Component: ConsentCategoryCarousel },
  { path: "/signup/password", Component: PasswordSetup },
  { path: "/signup/complete", Component: Complete },
];
