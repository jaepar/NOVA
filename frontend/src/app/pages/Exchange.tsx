import { MobileLayout } from '../components/layout/MobileLayout'
import { BottomNav } from '../components/layout/BottomNav'
import { useTranslation } from '../i18n'

export function Exchange() {
  const { t } = useTranslation()

  return (
    <>
      <MobileLayout title={t('exchange.title')} titleKey="exchange.title" headerType="close" closePath="/main">
        <div className="flex items-center justify-center pt-24 w-full">
          <div className="text-center space-y-4">
            <h2>{t('exchange.heading')}</h2>
            <p className="text-muted-foreground">{t('exchange.preparing')}</p>
          </div>
        </div>
      </MobileLayout>
      <BottomNav />
    </>
  )
}
