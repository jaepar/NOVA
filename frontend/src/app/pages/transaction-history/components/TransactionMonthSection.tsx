import type { AccountTransaction } from '../types'
import { TransactionHistoryItem } from './TransactionHistoryItem'

interface TransactionMonthSectionProps {
  month: string
  items: AccountTransaction[]
  showBalance: boolean
  onItemClick: (transactionId: string) => void
}

export function TransactionMonthSection({
  month,
  items,
  showBalance,
  onItemClick,
}: TransactionMonthSectionProps) {
  return (
    <section>
      <h3 className="mb-3 text-[20px] font-bold leading-7 text-foreground">{month}</h3>

      <div className="divide-y divide-border border-y border-border">
        {items.map((transaction) => (
          <TransactionHistoryItem
            key={transaction.id}
            transaction={transaction}
            showBalance={showBalance}
            onClick={() => onItemClick(transaction.id)}
          />
        ))}
      </div>
    </section>
  )
}
