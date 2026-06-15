import type { RouteObject } from 'react-router-dom'
import { lazyComponent } from './lazyRoute'

export const globalTransferRoutes: RouteObject[] = [
  { path: '/global-transfer', lazy: lazyComponent(() => import('../pages/global-transfer/TransferHome'), 'TransferHome') },
  { path: '/global-transfer/history', lazy: lazyComponent(() => import('../pages/global-transfer/TransferHistory'), 'TransferHistory') },
  { path: '/global-transfer/send/step-01', lazy: lazyComponent(() => import('../pages/global-transfer/Step01-TransferTermsAgreement'), 'TransferTermsAgreement') },
  { path: '/global-transfer/send/step-02', lazy: lazyComponent(() => import('../pages/global-transfer/Step02-TransferBasicInfo'), 'Step02TransferBasicInfo') },
  { path: '/global-transfer/send/step-03', lazy: lazyComponent(() => import('../pages/global-transfer/Step03-TransferRateSummary'), 'Step03TransferRateSummary') },
  { path: '/global-transfer/send/step-04', lazy: lazyComponent(() => import('../pages/global-transfer/Step04-TransferSenderInfo'), 'Step04TransferSenderInfo') },
  { path: '/global-transfer/send/step-05', lazy: lazyComponent(() => import('../pages/global-transfer/Step05-TransferRecipientInfo'), 'Step05TransferRecipientInfo') },
  { path: '/global-transfer/send/step-05/swift-code-lookup', lazy: lazyComponent(() => import('../pages/global-transfer/Step05-TransferSwiftCodeLookup'), 'Step05TransferSwiftCodeLookup') },
  { path: '/global-transfer/send/step-06-failed', lazy: lazyComponent(() => import('../pages/global-transfer/Step06-TransferSubmitFailed'), 'Step06TransferSubmitFailed') },
  { path: '/global-transfer/send/step-06', lazy: lazyComponent(() => import('../pages/global-transfer/Step06-TransferSubmitSuccess'), 'Step06TransferSubmitSuccess') },
  { path: '/global-transfer/send/step-01/terms/:termId', lazy: lazyComponent(() => import('../pages/global-transfer/Step01-TransferTermDetail'), 'TransferTermDetail') },
  { path: '/global-transfer/send/step-01/categories/:categoryId/consent', lazy: lazyComponent(() => import('../pages/global-transfer/Step01-TransferAllTermsAgreements'), 'TransferAllTermsAgreements') },
  { path: '/global-transfer/send/verification', lazy: lazyComponent(() => import('../pages/global-transfer/TransferInitialVerification'), 'TransferInitialVerification') },
]
