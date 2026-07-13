import { useNavigate } from 'react-router-dom'
import { Camera, CheckCircle2, CircleAlert } from 'lucide-react'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useTranslation } from '../../i18n'
import { DemoVerificationProgress } from './DemoVerificationProgress'

export function DemoPassportGuide() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const guideItems = [
    t('certificate.passportGuide1'),
    t('certificate.passportGuide2'),
    t('certificate.passportGuide3'),
    t('certificate.passportGuide4'),
  ]

  return (
    <MobileLayout
      title={t('certificate.title')}
      backPath="/demo/verification/document"
      bottomContent={
        <Btn_1Col onClick={() => navigate('/demo/verification/passport-ocr')}>
          {t('certificate.passportStartCapture')}
        </Btn_1Col>
      }
    >
      <div className="space-y-5 pb-2">
        <DemoVerificationProgress currentStep={2} />
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold leading-tight">
            {t('certificate.step04HeadingLine1')}
            <br />
            {t('certificate.step04HeadingLine2')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('certificate.step04SubHeading')}
          </p>
        </section>

        <section className="space-y-4 rounded-2xl bg-secondary p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-primary">
            <Camera className="h-7 w-7" />
          </div>
          <div className="space-y-3">
            {guideItems.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2 rounded-2xl bg-secondary p-4">
          <div className="flex items-center gap-2 text-primary">
            <CircleAlert className="h-5 w-5" />
            <p className="font-medium">{t('certificate.cautionTitle')}</p>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            {t('certificate.passportCaution')}
          </p>
        </section>
      </div>
    </MobileLayout>
  )
}
