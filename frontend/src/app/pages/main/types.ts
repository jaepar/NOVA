import type { ReactNode } from 'react'

export interface ServiceItem {
  id: string
  icon: ReactNode
  label: string
  path?: string
  disabled?: boolean
}

export interface ExchangeRateItem {
  currency: string
  rate: string
  change: string
  trend: 'UP' | 'DOWN' | 'FLAT'
}
