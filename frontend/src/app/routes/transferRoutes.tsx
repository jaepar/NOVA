import type { RouteObject } from 'react-router-dom'
import { lazyComponent } from './lazyRoute'

export const transferRoutes: RouteObject[] = [
  { path: '/transfer', lazy: lazyComponent(() => import('../pages/transfer/Step01-AccountSelect'), 'TransferAccountSelect') },
  { path: '/transfer/amount', lazy: lazyComponent(() => import('../pages/transfer/Step02-Amount'), 'TransferAmount') },
  { path: '/transfer/amount-confirm', lazy: lazyComponent(() => import('../pages/transfer/Step03-AmountConfirm'), 'TransferAmountConfirm') },
  {
    path: '/transfer/memo/recipient',
    lazy: async () => {
      const { TransferMemoEdit } = await import('../pages/transfer/Step04-MemoEdit')

      return {
        Component: () => <TransferMemoEdit type="recipient" />,
      }
    },
  },
  {
    path: '/transfer/memo/sender',
    lazy: async () => {
      const { TransferMemoEdit } = await import('../pages/transfer/Step04-MemoEdit')

      return {
        Component: () => <TransferMemoEdit type="sender" />,
      }
    },
  },
  { path: '/transfer/review', lazy: lazyComponent(() => import('../pages/transfer/Step05-Review'), 'TransferReview') },
  { path: '/transfer/complete', lazy: lazyComponent(() => import('../pages/transfer/Step06-Complete'), 'TransferComplete') },
  { path: '/transfer/failed', lazy: lazyComponent(() => import('../pages/transfer/Step07-Failed'), 'TransferFailed') },
]
