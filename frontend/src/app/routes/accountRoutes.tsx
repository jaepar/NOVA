import type { RouteObject } from 'react-router-dom'
import { lazyComponent } from './lazyRoute'

export const accountRoutes: RouteObject[] = [
  { path: '/account/step-01', lazy: lazyComponent(() => import('../pages/account/Step01-PreOpenNotice'), 'Step01PreOpenNotice') },
  { path: '/account/step-02', lazy: lazyComponent(() => import('../pages/account/Step02-EmailVerification'), 'Step02EmailVerification') },
  { path: '/account/step-03', lazy: lazyComponent(() => import('../pages/account/Step03-PassportCaptureGuide'), 'PassportCaptureGuide') },
  { path: '/account/step-04', lazy: lazyComponent(() => import('../pages/account/Step04-PassportCameraCapture'), 'PassportCameraCapture') },
  { path: '/account/step-05', lazy: lazyComponent(() => import('../pages/account/Step05-NfcGuide'), 'NfcGuide') },
  { path: '/account/step-06', lazy: lazyComponent(() => import('../pages/account/Step06-LivenessGuide'), 'LivenessGuide') },
  { path: '/account/step-07', lazy: lazyComponent(() => import('../pages/account/Step07-LivenessTermsAgreement'), 'LivenessConsentAgreement') },
  { path: '/account/step-07/terms/:termId', lazy: lazyComponent(() => import('../pages/account/Step07-TermDetail'), 'LivenessConsentTermDetail') },
  { path: '/account/step-07/categories/:categoryId/consent', lazy: lazyComponent(() => import('../pages/account/Step07-AllTermsAgreements'), 'LivenessConsentAllTermsAgreements') },
  { path: '/account/step-08', lazy: lazyComponent(() => import('../pages/account/Step08-LivenessCameraCapture'), 'LivenessCameraCapture') },
  { path: '/account/step-09', lazy: lazyComponent(() => import('../pages/account/Step09-AccountTermsAgreement'), 'AccountTermsAgreement') },
  { path: '/account/step-09/terms/:termId', lazy: lazyComponent(() => import('../pages/account/Step09-TermDetail'), 'AccountConsentTermDetail') },
  { path: '/account/step-09/categories/:categoryId/consent', lazy: lazyComponent(() => import('../pages/account/Step09-AllTermsAgreements'), 'AccountConsentAllTermsAgreements') },
  { path: '/account/step-10', lazy: lazyComponent(() => import('../pages/account/Step10-CustomerInfoRegistration'), 'Step10CustomerInfoRegistration') },
  { path: '/account/step-11', lazy: lazyComponent(() => import('../pages/account/Step11-JobInformation'), 'Step11JobInformation') },
  { path: '/account/step-12', lazy: lazyComponent(() => import('../pages/account/Step12-TransactionPurposeAndFundSource'), 'Step12TransactionPurposeAndFundSource') },
  { path: '/account/step-13', lazy: lazyComponent(() => import('../pages/account/Step13-TaxLiabilityCheck'), 'Step13TaxLiabilityCheck') },
  { path: '/account/step-14', lazy: lazyComponent(() => import('../pages/account/Step14-AccountPasswordSetup'), 'Step14AccountPasswordSetup') },
  {
    path: '/account/step-15',
    lazy: async () => {
      const { Success } = await import('../pages/common/Success')

      return {
        Component: () => (
          <Success
            headerTitle="입출금계좌 개설"
            headerTitleKey="account.openingTitle"
            task={"우리 SUPER주거래\n통장을 만들었어요"}
            taskKey="account.completeTask"
            description="지금 바로 활용해 볼까요?"
            descriptionKey="account.completeDescription"
            buttonText="확인"
            buttonTextKey="common.confirm"
            redirectPath="/main"
          />
        ),
      }
    },
  },
]
