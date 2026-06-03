import type { RouteObject } from "react-router-dom";
import { TransferHome } from "../pages/transfer/TransferHome";
import { TransferInitialVerification } from "../pages/transfer/TransferInitialVerification";
import { TransferHistory } from "../pages/transfer/TransferHistory";
import { TransferTermsAgreement } from "../pages/transfer/Step01-TransferTermsAgreement";
import { TransferTermDetail } from "../pages/transfer/Step01-TransferTermDetail";
import { TransferAllTermsAgreements } from "../pages/transfer/Step01-TransferAllTermsAgreements";
import { Step02TransferBasicInfo } from "../pages/transfer/Step02-TransferBasicInfo";
import { Step03TransferRateSummary } from "../pages/transfer/Step03-TransferRateSummary";
import { Step04TransferSenderInfo } from "../pages/transfer/Step04-TransferSenderInfo";
import { Step05TransferRecipientInfo } from "../pages/transfer/Step05-TransferRecipientInfo";
import { Step05TransferSwiftCodeLookup } from "../pages/transfer/Step05-TransferSwiftCodeLookup";
import { Step06TransferSubmitFailed } from "../pages/transfer/Step06-TransferSubmitFailed";
import { Step06TransferSubmitSuccess } from "../pages/transfer/Step06-TransferSubmitSuccess";

export const transferRoutes: RouteObject[] = [
  { path: "/transfer", Component: TransferHome },
  { path: "/transfer/history", Component: TransferHistory },
  { path: "/transfer/send/step-01", Component: TransferTermsAgreement },
  { path: "/transfer/send/step-02", Component: Step02TransferBasicInfo },
  { path: "/transfer/send/step-03", Component: Step03TransferRateSummary },
  { path: "/transfer/send/step-04", Component: Step04TransferSenderInfo },
  { path: "/transfer/send/step-05", Component: Step05TransferRecipientInfo },
  { path: "/transfer/send/step-05/swift-code-lookup", Component: Step05TransferSwiftCodeLookup },
  { path: "/transfer/send/step-06-failed", Component: Step06TransferSubmitFailed },
  { path: "/transfer/send/step-06", Component: Step06TransferSubmitSuccess },
  { path: "/transfer/send/step-01/terms/:termId", Component: TransferTermDetail },
  { path: "/transfer/send/step-01/categories/:categoryId/consent", Component: TransferAllTermsAgreements },
  { path: "/transfer/send/verification", Component: TransferInitialVerification },
];
