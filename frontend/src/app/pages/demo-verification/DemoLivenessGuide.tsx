import { useNavigate } from 'react-router-dom'
import { Camera, Lightbulb, ScanFace } from 'lucide-react'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useTranslation } from '../../i18n'
import { DemoVerificationProgress } from './DemoVerificationProgress'

export function DemoLivenessGuide() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <MobileLayout
      title={t('certificate.title')}
      backPath="/demo/verification/nfc"
      bottomContent={
        <Btn_1Col onClick={() => navigate('/demo/verification/liveness')}>
          {t('certificate.livenessStart')}
        </Btn_1Col>
      }
    >
      <div className="space-y-5 pb-2">
        <DemoVerificationProgress currentStep={4} />
        <section className="space-y-1">
          <h2 className="text-2xl font-semibold leading-tight">
            {t('certificate.step07HeadingLine1')}
            <br />
            {t('certificate.step07HeadingLine2')}
          </h2>
        </section>

        <section className="rounded-2xl bg-secondary p-5">
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-primary-light/30 px-6">
            <div className="h-1 w-24 rounded-full bg-primary-light/70" />
            <div className="flex h-40 w-40 items-center justify-center rounded-full border-2 border-primary-light/60">
              <ScanFace className="h-16 w-16 text-primary-light" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('certificate.step07GuideArea')}
            </p>
          </div>
        </section>

        <section className="space-y-3">
          {[
            [ScanFace, t('certificate.step07Guide1')],
            [Lightbulb, t('certificate.step07Guide2')],
            [Camera, t('certificate.step07Guide3')],
          ].map(([Icon, message]) => {
            const GuideIcon = Icon as typeof ScanFace
            return (
              <div key={String(message)} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <GuideIcon className="h-4 w-4" />
                </div>
                <p className="text-sm leading-relaxed">{String(message)}</p>
              </div>
            )
          })}
        </section>
      </div>
    </MobileLayout>
  )
}
