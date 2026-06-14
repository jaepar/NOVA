import { useNavigate } from 'react-router-dom'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { useTranslation } from '../../i18n'

export function Step02VerificationFlow() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const verificationSteps = [
    { id: 1, title: t('certificate.step02step1') },
    { id: 2, title: t('certificate.step02step2') },
    { id: 3, title: t('certificate.step02step3') },
    { id: 4, title: t('certificate.step02step4') },
  ]

  return (
    <MobileLayout
      title={t('certificate.title')}
      backPath="/certificate/step-01"
      bottomContent={<Btn_1Col onClick={() => navigate('/certificate/step-03')}>{t('common.next')}</Btn_1Col>}
    >
      <div className="space-y-6 pb-2">
        <section className="pt-2">
          <h2 className="text-2xl font-semibold leading-tight">{t('certificate.step02Heading')}</h2>
        </section>

        <section className="space-y-0">
          {verificationSteps.map((step, index) => {
            const isLast = index === verificationSteps.length - 1

            return (
              <div key={step.id}>
                <div className="flex items-center gap-3 rounded-2xl bg-secondary px-4 py-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    {step.id}
                  </div>

                  <div className="w-11 h-11 shrink-0 rounded-full bg-background border border-border flex items-center justify-center text-[10px] text-muted-foreground">
                    ICON
                  </div>

                  <p className="font-medium">{step.title}</p>
                </div>

                {!isLast && (
                  <div className="h-8 ml-8 flex items-center">
                    <div className="h-8 border-l-2 border-dotted border-border" />
                  </div>
                )}
              </div>
            )
          })}
        </section>
      </div>
    </MobileLayout>
  )
}
