import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CameraOff, ScanFace } from 'lucide-react'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { InlineBanner } from '../../components/design-system/InlineBanner'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useTranslation } from '../../i18n'
import { DemoVerificationProgress } from './DemoVerificationProgress'

type CameraStatus = 'requesting' | 'ready' | 'scanning' | 'complete' | 'error'

export function DemoLivenessCamera() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timersRef = useRef<number[]>([])
  const [status, setStatus] = useState<CameraStatus>('requesting')
  const [guideMessage, setGuideMessage] = useState(t('certificate.livenessWaitingCamera'))

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    timersRef.current = []
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const requestCamera = useCallback(async () => {
    clearTimers()
    stopCamera()
    setStatus('requesting')
    setGuideMessage(t('certificate.livenessWaitingCamera'))

    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('camera_not_supported')

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setGuideMessage(t('certificate.livenessHintCenterFace'))
      setStatus('ready')
    } catch {
      setGuideMessage(t('certificate.livenessNoCameraMessage'))
      setStatus('error')
    }
  }, [clearTimers, stopCamera, t])

  useEffect(() => {
    void requestCamera()
    return () => {
      clearTimers()
      stopCamera()
    }
  }, [clearTimers, requestCamera, stopCamera])

  const startDemoVerification = () => {
    if (status !== 'ready') return

    setStatus('scanning')
    setGuideMessage(t('certificate.livenessHintFaceFront'))

    timersRef.current = [
      window.setTimeout(() => {
        setGuideMessage(t('certificate.livenessHintHold'))
      }, 1200),
      window.setTimeout(() => {
        setGuideMessage(t('certificate.livenessHintVerifying'))
      }, 2400),
      window.setTimeout(() => {
        setStatus('complete')
        setGuideMessage(t('certificate.livenessHintComplete'))
      }, 3600),
      window.setTimeout(() => {
        stopCamera()
        navigate('/demo/verification/complete')
      }, 4300),
    ]
  }

  const handleClose = () => {
    clearTimers()
    stopCamera()
    navigate('/demo/verification/liveness-guide')
  }

  return (
    <MobileLayout
      title={t('certificate.title')}
      headerType="close"
      onClose={handleClose}
      closePath="/demo/verification/liveness-guide"
      bottomContent={
        status === 'ready' ? (
          <Btn_1Col onClick={startDemoVerification}>
            {t('certificate.livenessStart')}
          </Btn_1Col>
        ) : status === 'error' ? (
          <Btn_1Col onClick={() => void requestCamera()}>{t('common.retry')}</Btn_1Col>
        ) : undefined
      }
    >
      <div className="space-y-4 pb-2">
        <DemoVerificationProgress currentStep={4} />
        <section className="space-y-1 text-center">
          <h2 className="text-xl font-semibold">{t('certificate.step07HeadingLine2')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('demoVerification.cameraCaption')}
          </p>
        </section>

        <div className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-full border-2 border-primary-light/60 bg-secondary shadow-lg">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`h-full w-full -scale-x-100 object-cover ${status === 'error' ? 'hidden' : ''}`}
          />

          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <CameraOff className="h-14 w-14" />
              <p className="text-sm">{t('certificate.livenessNoCameraHeading')}</p>
            </div>
          )}

          {status === 'requesting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <ScanFace className="h-16 w-16 animate-pulse text-primary-light" />
            </div>
          )}

          {status !== 'error' && status !== 'requesting' && (
            <>
              <div className="pointer-events-none absolute inset-[16%] rounded-[48%] border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.18)]" />
              {status === 'scanning' && (
                <div className="pointer-events-none absolute left-[22%] right-[22%] top-1/2 h-0.5 animate-pulse bg-primary-light shadow-[0_0_12px_rgba(0,199,169,0.9)]" />
              )}
              {status === 'complete' && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/15">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl">
                    <ScanFace className="h-10 w-10" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <InlineBanner
          message={guideMessage}
          variant={status === 'error' ? 'error' : status === 'complete' ? 'success' : 'info'}
        />
      </div>
    </MobileLayout>
  )
}
