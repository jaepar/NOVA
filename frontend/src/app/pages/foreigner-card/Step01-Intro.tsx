import { CreditCard, Globe2, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useTranslation } from '../../i18n'
import { useForeignerCardRegistrationStore } from '../../stores/pageStores'

export function ForeignerCardIntro() {
  const navigate = useNavigate()
  const reset = useForeignerCardRegistrationStore((state) => state.reset)
  const { t } = useTranslation()

  const guideItems = [
    { icon: Globe2, text: t('foreignerCard.introGuide1') },
    { icon: ShieldCheck, text: t('foreignerCard.introGuide2') },
  ]

  const handleStart = () => {
    reset()
    navigate('/foreigner-card/step-02')
  }

  return (
    <MobileLayout
      title={t('foreignerCard.title')}
      backPath="/main"
      bottomContent={<Btn_1Col onClick={handleStart}>{t('foreignerCard.register')}</Btn_1Col>}
    >
      <div className="flex min-h-full flex-col pb-2">
        <section className="space-y-3 pt-6">
          <h2 className="text-2xl font-semibold leading-tight">
            {t('foreignerCard.introHeadingLine1')}
            <br />
            <span className="text-primary">{t('foreignerCard.introHeadingHighlight')}</span>
            {t('foreignerCard.introHeadingLine2')}
          </h2>
        </section>

        <section className="flex flex-1 items-center justify-center py-10">
          <div className="relative h-32 w-52 rounded-xl border-2 border-blue-200 bg-blue-50/70 shadow-sm">
            <div className="absolute left-6 top-8 h-12 w-12 rounded-full bg-blue-200" />
            <div className="absolute left-5 top-[82px] h-8 w-14 rounded-t-full bg-blue-200" />
            <div className="absolute right-7 top-8 h-2 w-20 rounded-full bg-blue-200" />
            <div className="absolute right-7 top-14 h-2 w-20 rounded-full bg-blue-200" />
            <div className="absolute right-14 top-20 h-2 w-14 rounded-full bg-blue-200" />
            <CreditCard className="absolute bottom-3 right-3 h-5 w-5 text-primary/40" />
          </div>
        </section>

        <section className="space-y-0">
          {guideItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.text} className="flex items-center gap-4 border-b border-border py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm text-foreground">{item.text}</p>
              </div>
            )
          })}
        </section>
      </div>
    </MobileLayout>
  )
}
