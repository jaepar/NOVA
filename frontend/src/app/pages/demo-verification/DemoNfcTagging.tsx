import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radio, Smartphone } from 'lucide-react'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { InlineBanner } from '../../components/design-system/InlineBanner'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useTranslation } from '../../i18n'
import { DemoVerificationProgress } from './DemoVerificationProgress'

type BannerVariant = 'info' | 'success' | 'warning' | 'error'

export function DemoNfcTagging() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isScanning, setIsScanning] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusVariant, setStatusVariant] = useState<BannerVariant>('info')
  const timerIdsRef = useRef<number[]>([])

  useEffect(
    () => () => {
      timerIdsRef.current.forEach((timerId) => window.clearTimeout(timerId))
    },
    [],
  )

  const finishTagging = () => {
    setStatusMessage(t('demoVerification.nfcSuccess'))
    setStatusVariant('success')
    timerIdsRef.current.push(
      window.setTimeout(() => navigate('/demo/verification/liveness-guide'), 700),
    )
  }

  const handleStartNfcTagging = () => {
    if (isScanning) return

    setIsScanning(true)
    setStatusMessage(t('certificate.nfcWaiting'))
    setStatusVariant('info')
    timerIdsRef.current.push(window.setTimeout(finishTagging, 1100))
  }

  return (
    <MobileLayout
      title={t('certificate.title')}
      backPath="/demo/verification/passport-ocr"
      bottomContent={
        <Btn_1Col onClick={handleStartNfcTagging} disabled={isScanning}>
          {isScanning ? t('certificate.nfcTagging') : t('certificate.nfcTagStart')}
        </Btn_1Col>
      }
    >
      <div className="space-y-4 pb-2">
        <DemoVerificationProgress currentStep={3} />
        <section className="space-y-1">
          <h2 className="text-2xl font-semibold leading-tight">
            {t('certificate.step06Heading')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('certificate.step06Subtitle')}
          </p>
        </section>

        <section className="rounded-2xl bg-secondary p-6">
          <div className="space-y-4">
            <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-border bg-background px-4">
              <div className="relative flex h-44 w-44 items-center justify-center">
                <div className={`absolute h-40 w-40 rounded-full border border-primary-light/30 ${isScanning ? 'animate-ping' : ''}`} />
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Smartphone className="h-16 w-16" />
                </div>
                <Radio className="absolute right-2 top-5 h-9 w-9 text-primary-light" />
              </div>
            </div>
            <p className="text-center text-sm text-foreground/90">
              {t('certificate.nfcPhoneInstruction')}
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-secondary p-4">
          <ul className="list-disc space-y-2 pl-5 text-sm text-foreground/90">
            <li>{t('certificate.nfcCheck1')}</li>
            <li>{t('certificate.nfcCheck2')}</li>
          </ul>
        </section>

        {statusMessage && <InlineBanner message={statusMessage} variant={statusVariant} />}
      </div>
    </MobileLayout>
  )
}
