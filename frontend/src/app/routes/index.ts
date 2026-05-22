import { mainRoutes } from "./mainRoutes";
import { walletRoutes } from "./walletRoutes";
import { certificateRoutes } from "./certificateRoutes";
import { commonTemplateRoutes } from "./commonTemplateRoutes";
import { signupRoutes } from "./signupRoutes";
import { NotFound } from "../pages/common/NotFound";

export const appRoutes = [
  ...mainRoutes,
  ...signupRoutes,
  ...walletRoutes,
  ...certificateRoutes,
  ...commonTemplateRoutes,
  { path: "*", Component: NotFound },
];
