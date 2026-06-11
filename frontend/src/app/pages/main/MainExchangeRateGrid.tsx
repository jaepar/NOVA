import { useTranslation } from '../../i18n'
import type { ExchangeRateItem } from './types'

interface MainExchangeRateGridProps {
  exchangeRates: ExchangeRateItem[]
}

export function MainExchangeRateGrid({ exchangeRates }: MainExchangeRateGridProps) {
  const { t } = useTranslation()

  return (
    <section className="space-y-4">
      <h3>{t('main.exchangeRates')}</h3>
      <div className="grid grid-cols-3 max-[389px]:grid-cols-1 gap-3">
        {exchangeRates.map((rate) => (
          <div key={rate.currency} className="bg-secondary p-4 rounded-2xl space-y-2">
            <div className="font-medium text-sm">{rate.currency}</div>
            <div className="text-lg font-semibold">{rate.rate}</div>
            <div className={`text-xs ${rate.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {rate.change}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
