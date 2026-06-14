import type { RouteObject } from 'react-router-dom'
import { lazyComponent } from './lazyRoute'

export const certificateRoutes: RouteObject[] = [
  { path: '/certificate/step-01', lazy: lazyComponent(() => import('../pages/certificate/Step01-TermsAgreement'), 'CertificateIssuanceConsentAgreement') },
  { path: '/certificate/step-01/terms/:termId', lazy: lazyComponent(() => import('../pages/certificate/Step01-TermDetail'), 'CertificateIssuanceConsentTermDetail') },
  { path: '/certificate/step-01/categories/:categoryId/consent', lazy: lazyComponent(() => import('../pages/certificate/Step01-AllTermsAgreements'), 'CertificateIssuanceConsentAllTermsAgreements') },
  { path: '/certificate/step-02', lazy: lazyComponent(() => import('../pages/certificate/Step02-VerificationFlow'), 'Step02VerificationFlow') },
  { path: '/certificate/step-03', lazy: lazyComponent(() => import('../pages/certificate/Step03-DocumentUpload'), 'Step03DocumentUpload') },
  { path: '/certificate/step-04', lazy: lazyComponent(() => import('../pages/certificate/Step04-PassportCaptureGuide'), 'PassportCaptureGuide') },
  { path: '/certificate/step-05', lazy: lazyComponent(() => import('../pages/certificate/Step05-PassportCameraCapture'), 'PassportCameraCapture') },
  { path: '/certificate/step-06', lazy: lazyComponent(() => import('../pages/certificate/Step06-NfcGuide'), 'NfcGuide') },
  { path: '/certificate/step-07', lazy: lazyComponent(() => import('../pages/certificate/Step07-LivenessGuide'), 'LivenessGuide') },
  { path: '/certificate/step-08', lazy: lazyComponent(() => import('../pages/certificate/Step08-LivenessTermsAgreement'), 'LivenessConsentAgreement') },
  { path: '/certificate/step-08/terms/:termId', lazy: lazyComponent(() => import('../pages/certificate/Step08-TermDetail'), 'LivenessConsentTermDetail') },
  { path: '/certificate/step-08/categories/:categoryId/consent', lazy: lazyComponent(() => import('../pages/certificate/Step08-AllTermsAgreements'), 'LivenessConsentAllTermsAgreements') },
  { path: '/certificate/step-09', lazy: lazyComponent(() => import('../pages/certificate/Step09-LivenessCameraCapture'), 'LivenessCameraCapture') },
  { path: '/certificate/step-10', lazy: lazyComponent(() => import('../pages/certificate/Step10-VerificationCompleted'), 'VerificationCompleted') },
  { path: '/certificate/step-11', lazy: lazyComponent(() => import('../pages/certificate/Step11-CertificateRequestCompleted'), 'CertificateRequestCompleted') },
  { path: '/certificate/corrections', lazy: lazyComponent(() => import('../pages/certificate/CertificateCorrectionDetail'), 'CertificateCorrectionDetail') },
  {
    path: '/certificate/corrections/complete',
    lazy: async () => {
      const { Success } = await import('../pages/common/Success')

      return {
        Component: () => (
          <Success
            headerTitle="보완 서류 제출"
            headerTitleKey="certificate.correctionCompleteTitle"
            task="보완 서류를 제출했어요"
            taskKey="certificate.correctionCompleteTask"
            description={"담당자가 서류를 확인한 뒤\n알림으로 결과를 안내해드릴게요."}
            descriptionKey="certificate.correctionCompleteDescription"
            buttonText="확인"
            buttonTextKey="common.confirm"
            redirectPath="/main"
            headerType="none"
          />
        ),
      }
    },
  },
]
