import { AppButton } from '../../components/design-system/AppButton'
import { useTranslation } from '../../i18n'

interface MainJobBannerProps {
  onClick?: () => void
}

export function MainJobBanner({ onClick }: MainJobBannerProps) {
  const { t } = useTranslation()

  return (
    <AppButton
      type="button"
      variant="unstyled"
      onClick={onClick}
      className="block w-full overflow-hidden rounded-2xl text-left"
    >
      <div className="bg-blue-600 p-6 h-40 flex flex-col justify-between relative">
        <div>
          <h3 className="text-white text-lg font-medium mb-2">{t('main.jobTitle')}</h3>
          <p className="text-white/90 text-sm">{t('main.jobDescription')}</p>
        </div>
        <div className="absolute right-6 bottom-6 flex gap-2">
          <div className="w-12 h-12 rounded-full bg-white/20" />
          <div className="w-12 h-12 rounded-full bg-white/20" />
          <div className="w-12 h-12 rounded-full bg-white/20" />
        </div>
      </div>
    </AppButton>
  )
}
