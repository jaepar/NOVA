import type { RouteObject } from 'react-router-dom'
import { lazyComponent } from './lazyRoute'

export const foreignerCardRoutes: RouteObject[] = [
  { path: '/foreigner-card/step-01', lazy: lazyComponent(() => import('../pages/foreigner-card/Step01-Intro'), 'ForeignerCardIntro') },
  { path: '/foreigner-card/step-02', lazy: lazyComponent(() => import('../pages/foreigner-card/Step02-CaptureGuide'), 'ForeignerCardCaptureGuide') },
  { path: '/foreigner-card/step-03', lazy: lazyComponent(() => import('../pages/foreigner-card/Step03-CameraCapture'), 'ForeignerCardCameraCapture') },
  { path: '/foreigner-card/step-04', lazy: lazyComponent(() => import('../pages/foreigner-card/Step04-OcrReview'), 'ForeignerCardOcrReview') },
  { path: '/foreigner-card/step-05', lazy: lazyComponent(() => import('../pages/foreigner-card/Step05-Completed'), 'ForeignerCardCompleted') },
]
