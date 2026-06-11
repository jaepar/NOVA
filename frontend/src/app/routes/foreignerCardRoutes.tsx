import type { RouteObject } from 'react-router-dom'
import { ForeignerCardIntro } from '../pages/foreigner-card/Step01-Intro'
import { ForeignerCardCaptureGuide } from '../pages/foreigner-card/Step02-CaptureGuide'
import { ForeignerCardCameraCapture } from '../pages/foreigner-card/Step03-CameraCapture'
import { ForeignerCardOcrReview } from '../pages/foreigner-card/Step04-OcrReview'
import { ForeignerCardCompleted } from '../pages/foreigner-card/Step05-Completed'

export const foreignerCardRoutes: RouteObject[] = [
  { path: '/foreigner-card/step-01', Component: ForeignerCardIntro },
  { path: '/foreigner-card/step-02', Component: ForeignerCardCaptureGuide },
  { path: '/foreigner-card/step-03', Component: ForeignerCardCameraCapture },
  { path: '/foreigner-card/step-04', Component: ForeignerCardOcrReview },
  { path: '/foreigner-card/step-05', Component: ForeignerCardCompleted },
]
