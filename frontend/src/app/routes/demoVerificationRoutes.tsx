import type { RouteObject } from 'react-router-dom'
import { DemoVerificationTheme } from '../pages/demo-verification/DemoVerificationTheme'
import { lazyComponent } from './lazyRoute'

export const demoVerificationRoutes: RouteObject[] = [
  {
    path: '/demo/verification',
    element: <DemoVerificationTheme />,
    children: [
      {
        index: true,
        lazy: lazyComponent(
          () => import('../pages/demo-verification/DemoDocumentUpload'),
          'DemoDocumentUpload',
        ),
      },
      {
        path: 'document',
        lazy: lazyComponent(
          () => import('../pages/demo-verification/DemoDocumentUpload'),
          'DemoDocumentUpload',
        ),
      },
      {
        path: 'passport-guide',
        lazy: lazyComponent(
          () => import('../pages/demo-verification/DemoPassportGuide'),
          'DemoPassportGuide',
        ),
      },
      {
        path: 'passport-ocr',
        lazy: lazyComponent(
          () => import('../pages/demo-verification/DemoPassportOcr'),
          'DemoPassportOcr',
        ),
      },
      {
        path: 'nfc',
        lazy: lazyComponent(
          () => import('../pages/demo-verification/DemoNfcTagging'),
          'DemoNfcTagging',
        ),
      },
      {
        path: 'liveness-guide',
        lazy: lazyComponent(
          () => import('../pages/demo-verification/DemoLivenessGuide'),
          'DemoLivenessGuide',
        ),
      },
      {
        path: 'liveness',
        lazy: lazyComponent(
          () => import('../pages/demo-verification/DemoLivenessCamera'),
          'DemoLivenessCamera',
        ),
      },
      {
        path: 'complete',
        lazy: lazyComponent(
          () => import('../pages/demo-verification/DemoVerificationComplete'),
          'DemoVerificationComplete',
        ),
      },
      {
        path: 'request-complete',
        lazy: lazyComponent(
          () => import('../pages/demo-verification/DemoCertificateRequestComplete'),
          'DemoCertificateRequestComplete',
        ),
      },
    ],
  },
]
