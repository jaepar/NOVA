import type { RouteObject } from 'react-router-dom'
import { Step01PreOpenNotice } from '../pages/account/Step01-PreOpenNotice'
import { Step02EmailVerification } from '../pages/account/Step02-EmailVerification'
import { PassportCaptureGuide } from '../pages/account/Step03-PassportCaptureGuide'
import { PassportCameraCapture } from '../pages/account/Step04-PassportCameraCapture'
import { NfcGuide } from '../pages/account/Step05-NfcGuide'
import { LivenessGuide } from '../pages/account/Step06-LivenessGuide'
import { LivenessConsentAgreement } from '../pages/account/Step07-LivenessTermsAgreement'
import { LivenessConsentTermDetail } from '../pages/account/Step07-TermDetail'
import { LivenessConsentAllTermsAgreements } from '../pages/account/Step07-AllTermsAgreements'
import { LivenessCameraCapture } from '../pages/account/Step08-LivenessCameraCapture'
import { AccountTermsAgreement } from '../pages/account/Step09-AccountTermsAgreement'
import { AccountConsentTermDetail } from '../pages/account/Step09-TermDetail'
import { AccountConsentAllTermsAgreements } from '../pages/account/Step09-AllTermsAgreements'
import { Step10CustomerInfoRegistration } from '../pages/account/Step10-CustomerInfoRegistration'
import { Step11JobInformation } from '../pages/account/Step11-JobInformation'
import { Step12TransactionPurposeAndFundSource } from '../pages/account/Step12-TransactionPurposeAndFundSource'
import { Step13TaxLiabilityCheck } from '../pages/account/Step13-TaxLiabilityCheck'
import { Step14AccountPasswordSetup } from '../pages/account/Step14-AccountPasswordSetup'
import { Success } from '../pages/common/Success'

export const accountRoutes: RouteObject[] = [
  { path: '/account/step-01', Component: Step01PreOpenNotice },
  { path: '/account/step-02', Component: Step02EmailVerification },
  { path: '/account/step-03', Component: PassportCaptureGuide },
  { path: '/account/step-04', Component: PassportCameraCapture },
  { path: '/account/step-05', Component: NfcGuide },
  { path: '/account/step-06', Component: LivenessGuide },
  { path: '/account/step-07', Component: LivenessConsentAgreement },
  { path: '/account/step-07/terms/:termId', Component: LivenessConsentTermDetail },
  { path: '/account/step-07/categories/:categoryId/consent', Component: LivenessConsentAllTermsAgreements },
  { path: '/account/step-08', Component: LivenessCameraCapture },
  { path: '/account/step-09', Component: AccountTermsAgreement },
  { path: '/account/step-09/terms/:termId', Component: AccountConsentTermDetail },
  { path: '/account/step-09/categories/:categoryId/consent', Component: AccountConsentAllTermsAgreements },
  { path: '/account/step-10', Component: Step10CustomerInfoRegistration },
  { path: '/account/step-11', Component: Step11JobInformation },
  { path: '/account/step-12', Component: Step12TransactionPurposeAndFundSource },
  { path: '/account/step-13', Component: Step13TaxLiabilityCheck },
  { path: '/account/step-14', Component: Step14AccountPasswordSetup },
  {
    path: '/account/step-15',
    element: (
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
  },
]
