import { AppButton } from '../../components/design-system/AppButton'
import { useTranslation } from '../../i18n'
import type { ServiceItem } from './types'

interface MainServiceGridProps {
  services: ServiceItem[]
  onServiceClick: (service: ServiceItem) => void
}

export function MainServiceGrid({ services, onServiceClick }: MainServiceGridProps) {
  const { t } = useTranslation()

  return (
    <section className="space-y-4">
      <h3>{t('main.life')}</h3>
      <div className="grid grid-cols-3 gap-4 max-[359px]:grid-cols-1">
        {services.map((service) => (
          <AppButton
            variant="unstyled"
            key={service.id}
            type="button"
            disabled={service.disabled}
            onClick={() => onServiceClick(service)}
            className="flex flex-col items-center gap-2 rounded-xl transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50 max-[359px]:bg-secondary max-[359px]:p-4"
          >
            <div className="text-blue-500">{service.icon}</div>
            <span className="text-center w-full text-xs">{service.label}</span>
          </AppButton>
        ))}
      </div>
    </section>
  )
}
