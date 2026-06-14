import { useNavigate } from 'react-router-dom'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { useTranslation } from '../../i18n'

export function NotFound() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <MobileLayout
      title="Page Not Found"
      titleKey="status.notFound.title"
      headerType="close"
      bottomContent={<Btn_1Col onClick={() => navigate('/')}>{t('common.goHome')}</Btn_1Col>}
    >
      <div className="flex flex-col items-center justify-center gap-6 text-center h-full">
        <div className="text-8xl">404</div>
        <div className="space-y-2">
          <h2>{t('status.notFound.heading')}</h2>
          <p className="text-muted-foreground">{t('status.notFound.description')}</p>
        </div>
      </div>
    </MobileLayout>
  )
}
