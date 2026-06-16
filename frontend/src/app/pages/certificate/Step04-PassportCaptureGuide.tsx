import { useNavigate } from 'react-router-dom'
import { Camera, CheckCircle2, CircleAlert } from 'lucide-react'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { useTranslation } from '../../i18n'

export function PassportCaptureGuide() {
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
      onBack={() => navigate('/certificate/step-03', { state: { resetDocumentUpload: true } })}
      bottomContent={
        <Btn_1Col onClick={() => navigate('/certificate/step-05')}>{t('certificate.passportStartCapture')}</Btn_1Col>
      }
    >
      <div className="space-y-5 pb-2">
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

        <section className="rounded-2xl bg-secondary p-5 space-y-4">
          <div className="w-14 h-14 rounded-full bg-background border border-border flex items-center justify-center text-primary">
            <Camera className="w-7 h-7" />
          </div>
          <div className="space-y-3">
            {guideItems.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-secondary p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <CircleAlert className="w-5 h-5" />
            <p className="font-medium">{t('certificate.cautionTitle')}</p>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {t('certificate.passportCaution')}
          </p>
        </section>
      </div>
    </MobileLayout>
  )
}
