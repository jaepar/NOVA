import { AppButton } from '../../components/design-system/AppButton'
import type { ServiceItem } from './types'

interface MainServiceGridProps {
  services: ServiceItem[]
  onServiceClick: (path?: string) => void
}

export function MainServiceGrid({ services, onServiceClick }: MainServiceGridProps) {
  return (
    <section className="space-y-4">
      <h3>생활</h3>
      <div className="grid grid-cols-3 gap-4 max-[359px]:grid-cols-1">
        {services.map((service) => (
          <AppButton
            variant="unstyled"
            key={service.label}
            onClick={() => onServiceClick(service.path)}
            className="flex flex-col items-center gap-2 rounded-xl transition-colors hover:bg-secondary max-[359px]:bg-secondary max-[359px]:p-4"
          >
            <div className="text-blue-500">{service.icon}</div>
            <span className="text-center w-full text-xs">{service.label}</span>
          </AppButton>
        ))}
      </div>
    </section>
  )
}
