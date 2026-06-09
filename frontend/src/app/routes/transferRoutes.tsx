import type { RouteObject } from 'react-router-dom'
import { TransferAccountSelect } from '../pages/transfer/Step01-AccountSelect'
import { TransferAmount } from '../pages/transfer/Step02-Amount'
import { TransferAmountConfirm } from '../pages/transfer/Step03-AmountConfirm'
import { TransferMemoEdit } from '../pages/transfer/Step04-MemoEdit'
import { TransferReview } from '../pages/transfer/Step05-Review'
import { TransferComplete } from '../pages/transfer/Step06-Complete'
import { TransferFailed } from '../pages/transfer/Step07-Failed'

export const transferRoutes: RouteObject[] = [
  { path: '/transfer', Component: TransferAccountSelect },
  { path: '/transfer/amount', Component: TransferAmount },
  { path: '/transfer/amount-confirm', Component: TransferAmountConfirm },
  {
    path: '/transfer/memo/recipient',
    element: <TransferMemoEdit type="recipient" />,
  },
  {
    path: '/transfer/memo/sender',
    element: <TransferMemoEdit type="sender" />,
  },
  { path: '/transfer/review', Component: TransferReview },
  { path: '/transfer/complete', Component: TransferComplete },
  { path: '/transfer/failed', Component: TransferFailed },
]
