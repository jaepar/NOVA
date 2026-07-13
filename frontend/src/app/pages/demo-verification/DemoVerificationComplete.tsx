import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useTranslation } from '../../i18n'
import { DemoVerificationProgress } from './DemoVerificationProgress'

export function DemoVerificationComplete() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const completedItems = [
    t('certificate.completedItem1'),
    t('certificate.completedItem2'),
    t('certificate.completedItem3'),
    t('certificate.completedItem4'),
  ]

  return (
    <MobileLayout
      title={t('certificate.title')}
      headerType="none"
      bottomContent={
        <Btn_1Col onClick={() => navigate('/demo/verification/request-complete')}>
          {t('certificate.finalSubmit')}
        </Btn_1Col>
      }
    >
      <div className="space-y-8 pb-2">
        <DemoVerificationProgress currentStep={4} />
        <section>
          <h2 className="text-center text-2xl font-semibold leading-tight">
            {t('certificate.step10HeadingLine1')}
            <br />
            {t('certificate.step10HeadingLine2')}
          </h2>
        </section>

        <section className="rounded-3xl border border-border bg-background p-4">
          <div className="divide-y divide-border">
            {completedItems.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between py-4 first:pt-2 last:pb-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-5 w-5" />
                  </div>
                  <p>{item}</p>
                </div>
                <div className="rounded-full bg-primary-soft px-4 py-1.5 text-sm font-medium text-primary">
                  {t('certificate.completedBadge')}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </MobileLayout>
  )
}
