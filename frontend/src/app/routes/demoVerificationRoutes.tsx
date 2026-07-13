import type { RouteObject } from 'react-router-dom'
import { lazyComponent } from './lazyRoute'

export const demoVerificationRoutes: RouteObject[] = [
  {
    path: '/demo/verification',
    lazy: lazyComponent(
      () => import('../pages/demo-verification/DemoDocumentUpload'),
      'DemoDocumentUpload',
    ),
  },
  {
    path: '/demo/verification/document',
    lazy: lazyComponent(
      () => import('../pages/demo-verification/DemoDocumentUpload'),
      'DemoDocumentUpload',
    ),
  },
  {
    path: '/demo/verification/passport-guide',
    lazy: lazyComponent(
      () => import('../pages/demo-verification/DemoPassportGuide'),
      'DemoPassportGuide',
    ),
  },
  {
    path: '/demo/verification/passport-ocr',
    lazy: lazyComponent(
      () => import('../pages/demo-verification/DemoPassportOcr'),
      'DemoPassportOcr',
    ),
  },
  {
    path: '/demo/verification/nfc',
    lazy: lazyComponent(
      () => import('../pages/demo-verification/DemoNfcTagging'),
      'DemoNfcTagging',
    ),
  },
  {
    path: '/demo/verification/liveness-guide',
    lazy: lazyComponent(
      () => import('../pages/demo-verification/DemoLivenessGuide'),
      'DemoLivenessGuide',
    ),
  },
  {
    path: '/demo/verification/liveness',
    lazy: lazyComponent(
      () => import('../pages/demo-verification/DemoLivenessCamera'),
      'DemoLivenessCamera',
    ),
  },
  {
    path: '/demo/verification/complete',
    lazy: lazyComponent(
      () => import('../pages/demo-verification/DemoVerificationComplete'),
      'DemoVerificationComplete',
    ),
  },
  {
    path: '/demo/verification/request-complete',
    lazy: lazyComponent(
      () => import('../pages/demo-verification/DemoCertificateRequestComplete'),
      'DemoCertificateRequestComplete',
    ),
  },
]
