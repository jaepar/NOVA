import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { AppButton } from '../../components/design-system/AppButton'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { useTranslation } from '../../i18n'
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
  const { t } = useTranslation()
  const account = useTransactionHistoryStore((state) => state.account)
  const errorMessage = useTransactionHistoryStore((state) => state.errorMessage)
  const isLoading = useTransactionHistoryStore((state) => state.isLoading)
  const isUpdatingMemo = useTransactionHistoryStore((state) => state.isUpdatingMemo)
  const findTransaction = useTransactionHistoryStore((state) => state.findTransaction)
  const fetchTransactionForDetail = useTransactionHistoryStore(
    (state) => state.fetchTransactionForDetail
  )
  const updateTransactionMemo = useTransactionHistoryStore((state) => state.updateTransactionMemo)
  const [isMemoSheetOpen, setMemoSheetOpen] = useState(false)
  const transaction = findTransaction(transactionId)

  useEffect(() => {
    if (!transaction) {
      void fetchTransactionForDetail(transactionId)
    }
  }, [fetchTransactionForDetail, transaction, transactionId])

  if (!transaction) {
    return (
      <MobileLayout
        title="거래내역 상세"
        titleKey="transactionHistory.detailTitle"
        headerType="close"
        closePath="/transaction-history"
        bottomContent={
          <Btn_1Col onClick={() => navigate('/transaction-history')}>
            {t('transactionHistory.confirm')}
          </Btn_1Col>
        }
      >
        <div className="flex h-full items-center justify-center text-[15px] font-medium text-muted-foreground">
          {isLoading ? t('transactionHistory.loading') : t('transactionHistory.notFound')}
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
        titleKey="transactionHistory.detailTitle"
        headerType="close"
        closePath="/transaction-history"
        bottomContent={
          <Btn_1Col onClick={() => navigate('/transaction-history')}>
            {t('transactionHistory.confirm')}
          </Btn_1Col>
        }
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
                {t('transactionHistory.afterBalance')} {formatWon(transaction.balanceAfter)}
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
                {t('transactionHistory.memoLabel')}
              </dt>
              <div className="flex min-w-0 items-center gap-1">
                <span
                  className={`min-w-0 truncate text-right text-[16px] font-semibold leading-6 ${
                    transaction.memo ? 'text-[#014ede]' : 'text-muted-foreground'
                  }`}
                >
                  {transaction.memo || t('transactionHistory.memoPlaceholder')}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </AppButton>

            <dl>
              <DetailRow label={t('transactionHistory.detailTitle')} value={transaction.dateTime} />
              <DetailRow label={t('transactionHistory.withdrawAccount')} value={account?.number ?? '-'} />
              <DetailRow label={t('transactionHistory.transactionTypeLabel')} value={t(`transactionHistory.transactionTypes.${transaction.rawType}` as Parameters<typeof t>[0], transaction.type)} />
            </dl>
          </section>

          {errorMessage && (
            <p className="mt-4 text-[13px] font-semibold leading-5 text-destructive">
              {errorMessage}
            </p>
          )}
        </div>
      </MobileLayout>

      <TransactionMemoSheet
        isOpen={isMemoSheetOpen}
        initialMemo={transaction.memo}
        isSaving={isUpdatingMemo}
        onClose={() => setMemoSheetOpen(false)}
        onSave={async (nextMemo) => {
          await updateTransactionMemo(transaction.transactionId, nextMemo)
          setMemoSheetOpen(false)
        }}
      />
    </>
  )
}
