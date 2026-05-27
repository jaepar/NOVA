import type { ReactNode } from 'react'

export interface ServiceItem {
  icon: ReactNode
  label: string
  path?: string
}

export interface ExchangeRateItem {
  currency: string
  rate: string
  change: string
  isPositive: boolean
}
