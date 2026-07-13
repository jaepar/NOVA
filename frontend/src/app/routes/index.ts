import type { RouteObject } from "react-router-dom";
import { mainRoutes } from "./mainRoutes";
import { walletRoutes } from "./walletRoutes";
import { certificateRoutes } from "./certificateRoutes";
import { commonTemplateRoutes } from "./commonTemplateRoutes";
import { signupRoutes } from "./signupRoutes";
import { loginRoutes } from "./loginRoutes";
import { profileRoutes } from "./profileRoutes";
import { jobRoutes } from "./jobRoutes";
import { globalTransferRoutes } from "./globalTransferRoutes";
import { transferRoutes } from "./transferRoutes";
import { foreignerCardRoutes } from "./foreignerCardRoutes";
import { accountRoutes } from "./accountRoutes";
import { transactionHistoryRoutes } from "./transactionHistoryRoutes";
import { demoVerificationRoutes } from "./demoVerificationRoutes";
import { lazyComponent } from "./lazyRoute";

export const appRoutes: RouteObject[] = [
  ...mainRoutes,
  ...globalTransferRoutes,
  ...loginRoutes,
  ...signupRoutes,
  ...profileRoutes,
  ...jobRoutes,
  ...transferRoutes,
  ...walletRoutes,
  ...foreignerCardRoutes,
  ...accountRoutes,
  ...transactionHistoryRoutes,
  ...certificateRoutes,
  ...demoVerificationRoutes,
  ...commonTemplateRoutes,
  { path: "*", lazy: lazyComponent(() => import("../pages/common/NotFound"), "NotFound") },
];
