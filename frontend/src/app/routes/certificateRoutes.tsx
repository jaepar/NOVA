import type { RouteObject } from "react-router-dom";
import { CertificateIssuanceConsentAgreement } from "../pages/certificate/Step01-TermsAgreement";
import { CertificateIssuanceConsentTermDetail } from "../pages/certificate/Step01-TermDetail";
import { CertificateIssuanceConsentAllTermsAgreements } from "../pages/certificate/Step01-AllTermsAgreements";
import { Step02VerificationFlow } from "../pages/certificate/Step02-VerificationFlow";
import { Step03DocumentUpload } from "../pages/certificate/Step03-DocumentUpload";
import { PassportCaptureGuide } from "../pages/certificate/Step04-PassportCaptureGuide";
import { PassportCameraCapture } from "../pages/certificate/Step05-PassportCameraCapture";
import { NfcGuide } from "../pages/certificate/Step06-NfcGuide";
import { LivenessGuide } from "../pages/certificate/Step07-LivenessGuide";
import { LivenessConsentAgreement } from "../pages/certificate/Step08-LivenessTermsAgreement";
import { LivenessConsentTermDetail } from "../pages/certificate/Step08-TermDetail";
import { LivenessConsentAllTermsAgreements } from "../pages/certificate/Step08-AllTermsAgreements";
import { LivenessCameraCapture } from "../pages/certificate/Step09-LivenessCameraCapture";
import { VerificationCompleted } from "../pages/certificate/Step10-VerificationCompleted";
import { CertificateRequestCompleted } from "../pages/certificate/Step11-CertificateRequestCompleted";

export const certificateRoutes: RouteObject[] = [
  { path: "/certificate/step-01", Component: CertificateIssuanceConsentAgreement },
  { path: "/certificate/step-01/terms/:termId", Component: CertificateIssuanceConsentTermDetail },
  { path: "/certificate/step-01/categories/:categoryId/consent", Component: CertificateIssuanceConsentAllTermsAgreements },
  { path: "/certificate/step-02", Component: Step02VerificationFlow },
  { path: "/certificate/step-03", Component: Step03DocumentUpload },
  { path: "/certificate/step-04", Component: PassportCaptureGuide },
  { path: "/certificate/step-05", Component: PassportCameraCapture },
  { path: "/certificate/step-06", Component: NfcGuide },
  { path: "/certificate/step-07", Component: LivenessGuide },
  { path: "/certificate/step-08", Component: LivenessConsentAgreement },
  { path: "/certificate/step-08/terms/:termId", Component: LivenessConsentTermDetail },
  { path: "/certificate/step-08/categories/:categoryId/consent", Component: LivenessConsentAllTermsAgreements },
  { path: "/certificate/step-09", Component: LivenessCameraCapture },
  { path: "/certificate/step-10", Component: VerificationCompleted },
  { path: "/certificate/step-11", Component: CertificateRequestCompleted },
];

