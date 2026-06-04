import { mainRoutes } from "./mainRoutes";
import { walletRoutes } from "./walletRoutes";
import { certificateRoutes } from "./certificateRoutes";
import { commonTemplateRoutes } from "./commonTemplateRoutes";
import { signupRoutes } from "./signupRoutes";
import { loginRoutes } from "./loginRoutes";
import { profileRoutes } from "./profileRoutes";
import { jobRoutes } from "./jobRoutes";
import { transferRoutes } from "./transferRoutes";

import { accountRoutes } from "./accountRoutes";
import { NotFound } from "../pages/common/NotFound";

export const appRoutes = [
  ...mainRoutes,
  ...loginRoutes,
  ...signupRoutes,
  ...profileRoutes,
  ...jobRoutes,
  ...transferRoutes,
  ...walletRoutes,
  ...accountRoutes,
  ...certificateRoutes,
  ...commonTemplateRoutes,
  { path: "*", Component: NotFound },
];
