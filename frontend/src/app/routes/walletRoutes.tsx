import type { RouteObject } from 'react-router-dom'
import { lazyComponent } from './lazyRoute'

export const walletRoutes: RouteObject[] = [
  { path: '/wallet', lazy: lazyComponent(() => import('../pages/wallet'), 'WalletSplash') },
  { path: '/wallet/terms', lazy: lazyComponent(() => import('../pages/wallet'), 'WalletTerms') },
  { path: '/wallet/home', lazy: lazyComponent(() => import('../pages/wallet'), 'WalletHome') },
  { path: '/wallet/charge', lazy: lazyComponent(() => import('../pages/wallet'), 'WalletCharge') },
  { path: '/wallet/payment', lazy: lazyComponent(() => import('../pages/wallet'), 'WalletPayment') },
]
