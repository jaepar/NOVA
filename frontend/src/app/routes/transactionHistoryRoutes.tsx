import type { RouteObject } from 'react-router-dom'
import { lazyComponent } from './lazyRoute'

export const transactionHistoryRoutes: RouteObject[] = [
  { path: '/transaction-history', lazy: lazyComponent(() => import('../pages/transaction-history/TransactionHistoryPage'), 'TransactionHistoryPage') },
  { path: '/transaction-history/:transactionId', lazy: lazyComponent(() => import('../pages/transaction-history/TransactionHistoryDetailPage'), 'TransactionHistoryDetailPage') },
]
