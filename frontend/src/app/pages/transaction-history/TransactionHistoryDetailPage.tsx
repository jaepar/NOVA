import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { AppButton } from '../../components/design-system/AppButton'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { accountTransactionHistory } from './data'
import { TransactionMemoSheet } from './components/TransactionMemoSheet'
import { useTransactionHistoryStore } from './store'
import { formatWon } from './utils'

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-b-0">
      <dt className="shrink-0 text-[15px] font-semibold leading-6 text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 text-right text-[16px] font-semibold leading-6 text-foreground">
        {value}
      </dd>
    </div>
  )
}

export function TransactionHistoryDetailPage() {
  const navigate = useNavigate()
  const { transactionId } = useParams()
  const memoByTransactionId = useTransactionHistoryStore((state) => state.memoByTransactionId)
  const setTransactionMemo = useTransactionHistoryStore((state) => state.setTransactionMemo)
  const [isMemoSheetOpen, setMemoSheetOpen] = useState(false)
  const baseTransaction = accountTransactionHistory.find((item) => item.id === transactionId)
  const transaction = baseTransaction
    ? {
        ...baseTransaction,
        memo: memoByTransactionId[baseTransaction.id] ?? baseTransaction.memo,
      }
    : undefined

  if (!transaction) {
    return (
      <MobileLayout
        title="거래내역 상세"
        headerType="close"
        closePath="/transaction-history"
        bottomContent={<Btn_1Col onClick={() => navigate('/transaction-history')}>확인</Btn_1Col>}
      >
        <div className="flex h-full items-center justify-center text-[15px] font-medium text-muted-foreground">
          거래내역을 찾을 수 없습니다.
        </div>
      </MobileLayout>
    )
  }

  const isDeposit = transaction.amount > 0
  const signedAmount = `${isDeposit ? '+' : '-'}${formatWon(Math.abs(transaction.amount))}`

  return (
    <>
      <MobileLayout
        title="거래내역 상세"
        headerType="close"
        closePath="/transaction-history"
        bottomContent={<Btn_1Col onClick={() => navigate('/transaction-history')}>확인</Btn_1Col>}
      >
        <div className="flex min-h-full flex-col pb-4">
          <section className="pb-8 pt-2">
            <h2 className="text-[21px] font-bold leading-8 text-foreground">{transaction.title}</h2>

            <div className="mt-7 flex flex-col items-end">
              <p
                className={`text-[28px] font-bold leading-9 ${
                  isDeposit ? 'text-[#014ede]' : 'text-foreground'
                }`}
              >
                {signedAmount}
              </p>
              <p className="mt-1 text-[14px] font-semibold leading-5 text-muted-foreground">
                거래후 잔액 {formatWon(transaction.balanceAfter)}
              </p>
            </div>
          </section>

          <section className="border-y border-border">
            <AppButton
              variant="unstyled"
              onClick={() => setMemoSheetOpen(true)}
              className="flex w-full items-center justify-between gap-4 border-b border-border py-4 text-left"
            >
              <dt className="shrink-0 text-[15px] font-semibold leading-6 text-muted-foreground">
                메모
              </dt>
              <div className="flex min-w-0 items-center gap-1">
                <span
                  className={`min-w-0 truncate text-right text-[16px] font-semibold leading-6 ${
                    transaction.memo ? 'text-[#014ede]' : 'text-muted-foreground'
                  }`}
                >
                  {transaction.memo || '메모를 입력해보세요'}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </AppButton>

            <dl>
              <DetailRow label="거래일시" value={transaction.dateTime} />
              <DetailRow label="출금계좌" value={transaction.withdrawalAccount} />
              <DetailRow label="거래유형" value={transaction.type} />
            </dl>
          </section>
        </div>
      </MobileLayout>

      <TransactionMemoSheet
        isOpen={isMemoSheetOpen}
        initialMemo={transaction.memo}
        onClose={() => setMemoSheetOpen(false)}
        onSave={(nextMemo) => {
          setTransactionMemo(transaction.id, nextMemo)
          setMemoSheetOpen(false)
        }}
      />
    </>
  )
}
