import { useEffect, useState } from 'react'
import { exchangeApi, type ExchangeRateApiItem, type ExchangeRatesResponse } from '../../api'
import { MobileLayout } from '../components/layout/MobileLayout'
import { BottomNav } from '../components/layout/BottomNav'
import { AppButton } from '../components/design-system/AppButton'
import { useTranslation } from '../i18n'

export function Exchange() {
  const { t } = useTranslation()
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateApiItem[]>([])
  const [summary, setSummary] = useState<ExchangeRatesResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadFailed, setIsLoadFailed] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadExchangeRates() {
      setIsLoading(true)
      setIsLoadFailed(false)

      try {
        const response = await exchangeApi.getExchangeRates()

        if (!isMounted) {
          return
        }

        setSummary(response)
        setExchangeRates(response.rates)
      } catch {
        if (!isMounted) {
          return
        }

        setSummary(null)
        setExchangeRates([])
        setIsLoadFailed(true)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadExchangeRates()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <MobileLayout title={t('exchange.title')} titleKey="exchange.title" headerType="close" closePath="/main">
        <div className="space-y-6 pb-6 pt-4">
          <section className="space-y-2">
            <h2 className="text-[24px] font-semibold leading-tight text-[#132347]">
              {t('exchange.heading')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {summary ? `${summary.effectiveDate} ${t('exchange.description')}` : t('exchange.description')}
            </p>
          </section>

          {isLoading ? (
            <div className="rounded-3xl border border-border bg-background px-5 py-8 text-center text-muted-foreground">
              {t('common.loading')}
            </div>
          ) : null}

          {isLoadFailed ? (
            <div className="space-y-3 rounded-3xl border border-border bg-background px-5 py-8 text-center">
              <p className="text-sm text-red-500">{t('exchange.loadFailed')}</p>
              <AppButton
                variant="outline"
                onClick={() => window.location.reload()}
                className="rounded-xl px-6 py-3"
              >
                {t('common.retry')}
              </AppButton>
            </div>
          ) : null}

          {!isLoading && !isLoadFailed ? (
            <section className="space-y-3">
              {exchangeRates.map((rate) => {
                const trendClass =
                  rate.changeDirection === 'UP'
                    ? 'text-green-600'
                    : rate.changeDirection === 'DOWN'
                      ? 'text-red-600'
                      : 'text-muted-foreground'
                const percentLabel = `${rate.changePercent > 0 ? '+' : ''}${rate.changePercent.toFixed(2)}%`

                return (
                  <div
                    key={`${rate.countryId}-${rate.currencyCode}`}
                    className="rounded-3xl border border-border bg-background px-5 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-foreground">{rate.currencyName}</p>
                        <p className="text-sm text-muted-foreground">{rate.currencyCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-foreground">
                          {rate.rate.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className={`text-sm ${trendClass}`}>{percentLabel}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </section>
          ) : null}
          <div className="rounded-3xl border border-border bg-[#F8FAFC] px-4 py-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {t('exchange.weekendGuide')}
            </p>
          </div>
        </div>
      </MobileLayout>
      <BottomNav />
    </>
  )
}
