import { useTranslation } from '../../i18n'
import type { ExchangeRateItem } from './types'

interface MainExchangeRateGridProps {
  exchangeRates: ExchangeRateItem[]
}

const flagSvgByCurrency: Record<string, string> = {
  USD: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#fff"/><path d="M0 0h64v5H0zm0 10h64v5H0zm0 10h64v5H0zm0 10h64v5H0zm0 10h64v5H0zm0 10h64v5H0zm0 10h64v4H0z" fill="#D92D20"/><rect width="30" height="35" fill="#174A9C"/></svg>`,
  JPY: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#fff"/><circle cx="32" cy="32" r="16" fill="#BC002D"/></svg>`,
  EUR: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#1F4DB8"/><g fill="#FFD84D"><circle cx="32" cy="13" r="3"/><circle cx="41.5" cy="16" r="3"/><circle cx="48" cy="23.5" r="3"/><circle cx="51" cy="32" r="3"/><circle cx="48" cy="41" r="3"/><circle cx="41.5" cy="48" r="3"/><circle cx="32" cy="51" r="3"/><circle cx="22.5" cy="48" r="3"/><circle cx="16" cy="41" r="3"/><circle cx="13" cy="32" r="3"/><circle cx="16" cy="23.5" r="3"/><circle cx="22.5" cy="16" r="3"/></g></svg>`,
}

const getFlagSrc = (currency: string) => {
  const svg = flagSvgByCurrency[currency]
  return svg ? `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` : undefined
}

export function MainExchangeRateGrid({ exchangeRates }: MainExchangeRateGridProps) {
  const { t } = useTranslation()

  return (
    <section className="main-responsive-grid-container space-y-4">
      <div className="space-y-1">
        <h3>{t('main.exchangeRates')}</h3>
      </div>
      <div className="main-responsive-grid">
        {exchangeRates.map((rate) => {
          const flagSrc = getFlagSrc(rate.currency)
          const trendClass =
            rate.trend === 'UP'
              ? 'text-green-600'
              : rate.trend === 'DOWN'
                ? 'text-red-600'
                : 'text-muted-foreground'

          return (
            <div key={rate.currency} className="main-exchange-rate-card min-h-[112px] rounded-2xl border border-border bg-white p-4">
              <div className="space-y-2">
                <div className="main-exchange-rate-header flex items-center gap-2">
                  <div className="font-medium text-sm">{rate.currency}</div>
                  {flagSrc && (
                    <img
                      src={flagSrc}
                      alt={`${rate.currency} ${t('main.flagAlt', 'flag')}`}
                      className="main-exchange-rate-flag h-5 w-5 shrink-0 rounded-full border border-white object-cover shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
                    />
                  )}
                </div>
                <div className="text-lg font-semibold">{rate.rate}</div>
                <div className={`text-xs ${trendClass}`}>
                  {rate.change}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
