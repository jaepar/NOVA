import type { WalletTransaction } from "../data/walletTransactionTypes";

interface WalletTransactionItemProps {
  transaction: WalletTransaction
  showMonth: boolean
  isLast: boolean
}

export function WalletTransactionItem({
  transaction,
  showMonth,
  isLast,
}: WalletTransactionItemProps) {
  const isDeposit = transaction.transactionFlow === 'DEPOSIT'
  const formattedAmount = `${isDeposit ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString(
    'ko-KR'
  )}원`

  return (
    <div>
      {showMonth && (
        <h3 className="border-b border-border bg-[#f4f4f6] px-4 py-2 text-[16px] font-medium leading-7 text-[#888888]">
          {transaction.month}
        </h3>
      )}

      <div className={`px-4 py-[17px] ${isLast ? '' : 'border-b border-border'}`}>
        <div className="mb-2 flex items-center gap-2 text-[15px] leading-6 text-muted-foreground">
          <span>{transaction.date}</span>
          <span>·</span>
          <span>{transaction.time}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="min-w-0 flex-1 truncate text-[17px] font-medium leading-7 text-foreground">
            {transaction.title}
          </p>
          <p
            className={`shrink-0 text-[18px] font-semibold leading-7 ${
              isDeposit ? 'text-[#003CA6]' : 'text-foreground'
            }`}
          >
            {formattedAmount}
          </p>
        </div>
      </div>
    </div>
  )
}
