import { AppButton } from '../../components/design-system/AppButton'
import type { ServiceItem } from './types'

interface MainServiceGridProps {
  services: ServiceItem[]
  onServiceClick: (path?: string) => void
}

export function MainServiceGrid({ services, onServiceClick }: MainServiceGridProps) {
  return (
    <section className="main-responsive-grid-container space-y-4">
      <h3>생활</h3>
      <div className="main-responsive-grid">
        {services.map((service) => (
          <AppButton
            variant="unstyled"
            key={service.label}
            onClick={() => onServiceClick(service.path)}
            className="main-service-button flex min-w-0 flex-col items-center gap-2 rounded-xl transition-colors hover:bg-secondary"
          >
            <div className="text-primary-light">{service.icon}</div>
            <span className="text-center w-full text-xs">{service.label}</span>
          </AppButton>
        ))}
      </div>
    </section>
  )
}
