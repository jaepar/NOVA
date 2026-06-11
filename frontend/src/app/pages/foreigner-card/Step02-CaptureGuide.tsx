import { CalendarDays, IdCard, ScanLine, SunMedium, Type } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useTranslation } from '../../i18n'

export function ForeignerCardCaptureGuide() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const cautionItems = [
    { icon: SunMedium, text: t('foreignerCard.caution1') },
    { icon: Type, text: t('foreignerCard.caution2') },
    { icon: CalendarDays, text: t('foreignerCard.caution3') },
  ]

  return (
    <MobileLayout
      title={t('foreignerCard.title')}
      backPath="/foreigner-card/step-01"
      bottomContent={
        <Btn_1Col onClick={() => navigate('/foreigner-card/step-03')}>{t('foreignerCard.capture')}</Btn_1Col>
      }
    >
      <div className="space-y-7 pb-2">
        <section className="space-y-3 pt-2">
          <h2 className="text-2xl font-semibold leading-tight">
            {t('foreignerCard.captureHeadingLine1')}
            <br />
            <span className="text-primary">{t('foreignerCard.captureHeadingHighlight')}</span>
            {t('foreignerCard.captureHeadingLine2')}
          </h2>
        </section>

        <section className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/20 px-5 py-10">
          <div className="flex flex-col items-center justify-center gap-5 text-center">
            <div className="flex h-12 w-16 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-primary">
              <IdCard className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t('foreignerCard.captureFrameLine1')}</p>
              <p className="text-sm text-muted-foreground">{t('foreignerCard.captureFrameLine2')}</p>
            </div>
            <ScanLine className="h-5 w-5 text-primary/60" />
          </div>
        </section>

        <section className="space-y-3">
          <p className="font-semibold">{t('foreignerCard.cautionTitle')}</p>
          <div className="divide-y divide-border">
            {cautionItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.text} className="flex items-center gap-4 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm text-foreground">{item.text}</p>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </MobileLayout>
  )
}
