import { AppButton } from '../../../components/design-system/AppButton'
import type { AccountTransaction } from '../types'
import { formatWon } from '../utils'

interface TransactionHistoryItemProps {
  transaction: AccountTransaction
  showBalance: boolean
  onClick: () => void
}

export function TransactionHistoryItem({
  transaction,
  showBalance,
  onClick,
}: TransactionHistoryItemProps) {
  const isDeposit = transaction.amount > 0
  const formattedAmount = `${isDeposit ? '+' : '-'}${formatWon(Math.abs(transaction.amount))}`
  const [, timeWithSeconds] = transaction.dateTime.split(' ')

  return (
    <AppButton
      variant="unstyled"
      onClick={onClick}
      className="w-full py-4 text-left transition-colors hover:bg-secondary/60"
    >
      <div className="mb-1 flex items-center gap-2 text-[13px] font-medium leading-5 text-muted-foreground">
        <span>{transaction.date.slice(5)}</span>
        <span>{timeWithSeconds}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <p className="min-w-0 flex-1 truncate text-[16px] font-semibold leading-6 text-foreground">
          {transaction.title}
        </p>

        <div className="shrink-0 text-right">
          <p
            className={`text-[16px] font-bold leading-6 ${
              isDeposit ? 'text-[#014ede]' : 'text-foreground'
            }`}
          >
            {formattedAmount}
          </p>
        </div>
      </div>

      {showBalance && (
        <p className="mt-1 text-[12px] font-medium leading-4 text-right text-muted-foreground">
          잔액 {formatWon(transaction.balanceAfter)}
        </p>
      )}
    </AppButton>
  )
}
