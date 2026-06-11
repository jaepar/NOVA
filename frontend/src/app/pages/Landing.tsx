import { useNavigate } from 'react-router-dom'
import { Btn_1Col } from '../components/design-system/Btn_1Col'
import { AppButton } from '../components/design-system/AppButton'
import { MobileLayout } from '../components/layout/MobileLayout'
import { useTranslation } from '../i18n'

export function Landing() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="h-full bg-background w-full relative">
      <div className="absolute top-4 right-5 z-50">
        <AppButton
          variant="unstyled"
          onClick={() => navigate('/language')}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('language.title')}
        </AppButton>
      </div>

      <MobileLayout
        title=""
        headerType="none"
        bottomContent={<Btn_1Col onClick={() => navigate('/language')}>{t('landing.start')}</Btn_1Col>}
      >
        <div className="flex flex-col items-center justify-center min-h-full">
          <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
            <div className="w-20 h-10 bg-white/30 rounded-full"></div>
          </div>

          <h1 className="text-2xl mb-2">
            <span className="text-blue-600">NOVA</span>
          </h1>

          <p className="text-muted-foreground text-center">{t('landing.subtitle')}</p>
        </div>
      </MobileLayout>
    </div>
  )
}
