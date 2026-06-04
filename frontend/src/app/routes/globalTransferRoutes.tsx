import type { RouteObject } from "react-router-dom";
import { TransferHome } from "../pages/global-transfer/TransferHome";
import { TransferInitialVerification } from "../pages/global-transfer/TransferInitialVerification";
import { TransferHistory } from "../pages/global-transfer/TransferHistory";
import { TransferTermsAgreement } from "../pages/global-transfer/Step01-TransferTermsAgreement";
import { TransferTermDetail } from "../pages/global-transfer/Step01-TransferTermDetail";
import { TransferAllTermsAgreements } from "../pages/global-transfer/Step01-TransferAllTermsAgreements";
import { Step02TransferBasicInfo } from "../pages/global-transfer/Step02-TransferBasicInfo";
import { Step03TransferRateSummary } from "../pages/global-transfer/Step03-TransferRateSummary";
import { Step04TransferSenderInfo } from "../pages/global-transfer/Step04-TransferSenderInfo";
import { Step05TransferRecipientInfo } from "../pages/global-transfer/Step05-TransferRecipientInfo";
import { Step05TransferSwiftCodeLookup } from "../pages/global-transfer/Step05-TransferSwiftCodeLookup";
import { Step06TransferSubmitFailed } from "../pages/global-transfer/Step06-TransferSubmitFailed";
import { Step06TransferSubmitSuccess } from "../pages/global-transfer/Step06-TransferSubmitSuccess";

export const globalTransferRoutes: RouteObject[] = [
  { path: "/global-transfer", Component: TransferHome },
  { path: "/global-transfer/history", Component: TransferHistory },
  { path: "/global-transfer/send/step-01", Component: TransferTermsAgreement },
  { path: "/global-transfer/send/step-02", Component: Step02TransferBasicInfo },
  { path: "/global-transfer/send/step-03", Component: Step03TransferRateSummary },
  { path: "/global-transfer/send/step-04", Component: Step04TransferSenderInfo },
  { path: "/global-transfer/send/step-05", Component: Step05TransferRecipientInfo },
  { path: "/global-transfer/send/step-05/swift-code-lookup", Component: Step05TransferSwiftCodeLookup },
  { path: "/global-transfer/send/step-06-failed", Component: Step06TransferSubmitFailed },
  { path: "/global-transfer/send/step-06", Component: Step06TransferSubmitSuccess },
  { path: "/global-transfer/send/step-01/terms/:termId", Component: TransferTermDetail },
  { path: "/global-transfer/send/step-01/categories/:categoryId/consent", Component: TransferAllTermsAgreements },
  { path: "/global-transfer/send/verification", Component: TransferInitialVerification },
];
