import { mainRoutes } from "./mainRoutes";
import { walletRoutes } from "./walletRoutes";
import { certificateRoutes } from "./certificateRoutes";
import { commonTemplateRoutes } from "./commonTemplateRoutes";
import { signupRoutes } from "./signupRoutes";
import { loginRoutes } from "./loginRoutes";
import { NotFound } from "../pages/common/NotFound";

export const appRoutes = [
  ...mainRoutes,
  ...loginRoutes,
  ...signupRoutes,
  ...walletRoutes,
  ...certificateRoutes,
  ...commonTemplateRoutes,
  { path: "*", Component: NotFound },
];
