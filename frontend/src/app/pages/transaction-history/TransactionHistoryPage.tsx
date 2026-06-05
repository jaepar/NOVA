import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { AppButton } from '../../components/design-system/AppButton'
import { Switch } from '../../components/ui/switch'
import { accountInfo, accountTransactionHistory } from './data'
import { useTransactionHistoryStore } from './store'
import { groupTransactionsByMonth, parseTransactionDate, parseTransactionDateTime } from './utils'
import { AccountSummaryCard } from './components/AccountSummaryCard'
import { TransactionMonthSection } from './components/TransactionMonthSection'
import { TransactionHistoryFilterSheet } from './components/TransactionHistoryFilterSheet'

export function TransactionHistoryPage() {
  const navigate = useNavigate()
  const [isFilterOpen, setFilterOpen] = useState(false)

  const selectedPeriod = useTransactionHistoryStore((state) => state.selectedPeriod)
  const selectedType = useTransactionHistoryStore((state) => state.selectedType)
  const selectedSort = useTransactionHistoryStore((state) => state.selectedSort)
  const searchKeyword = useTransactionHistoryStore((state) => state.searchKeyword)
  const showBalance = useTransactionHistoryStore((state) => state.showBalance)
  const customDateFrom = useTransactionHistoryStore((state) => state.customDateFrom)
  const customDateTo = useTransactionHistoryStore((state) => state.customDateTo)
  const memoByTransactionId = useTransactionHistoryStore((state) => state.memoByTransactionId)
  const setSelectedPeriod = useTransactionHistoryStore((state) => state.setSelectedPeriod)
  const setSelectedType = useTransactionHistoryStore((state) => state.setSelectedType)
  const setSelectedSort = useTransactionHistoryStore((state) => state.setSelectedSort)
  const setSearchKeyword = useTransactionHistoryStore((state) => state.setSearchKeyword)
  const setShowBalance = useTransactionHistoryStore((state) => state.setShowBalance)
  const setCustomDateFrom = useTransactionHistoryStore((state) => state.setCustomDateFrom)
  const setCustomDateTo = useTransactionHistoryStore((state) => state.setCustomDateTo)

  const transactions = accountTransactionHistory.map((transaction) => ({
    ...transaction,
    memo: memoByTransactionId[transaction.id] ?? transaction.memo,
  }))

  const normalizedKeyword = searchKeyword.trim().toLowerCase()

  const visibleTransactions = transactions.filter((transaction) => {
    const txDate = parseTransactionDate(transaction.date)

    if (selectedPeriod === '1주일') {
      const from = new Date()
      from.setDate(from.getDate() - 7)
      from.setHours(0, 0, 0, 0)
      if (txDate < from) return false
    } else if (selectedPeriod === '1개월') {
      const from = new Date()
      from.setMonth(from.getMonth() - 1)
      from.setHours(0, 0, 0, 0)
      if (txDate < from) return false
    } else if (selectedPeriod === '직접입력') {
      if (customDateFrom) {
        const from = new Date(customDateFrom)
        if (txDate < from) return false
      }
      if (customDateTo) {
        const to = new Date(customDateTo)
        to.setHours(23, 59, 59, 999)
        if (txDate > to) return false
      }
    }

    if (selectedType !== '전체') {
      if (selectedType === '입금' && transaction.amount <= 0) return false
      if (selectedType === '출금' && transaction.amount > 0) return false
    }

    if (!normalizedKeyword) return true
    return [transaction.title, transaction.counterParty, transaction.memo]
      .join(' ')
      .toLowerCase()
      .includes(normalizedKeyword)
  })

  const sortedTransactions = [...visibleTransactions].sort((a, b) => {
    const aTime = parseTransactionDateTime(a.dateTime).getTime()
    const bTime = parseTransactionDateTime(b.dateTime).getTime()
    return selectedSort === '과거순' ? aTime - bTime : bTime - aTime
  })
  const groupedTransactions = groupTransactionsByMonth(sortedTransactions)

  return (
    <>
      <MobileLayout title="거래내역조회" headerType="back" backPath="/main">
        <div className="-mx-5">
          <AccountSummaryCard account={accountInfo} onTransferClick={() => navigate('/transfer')} />

          <div className="h-2 bg-secondary" />

          <section className="px-5 pb-6 pt-5">
            <div className="flex items-center justify-between gap-4">
              <AppButton
                variant="unstyled"
                onClick={() => setFilterOpen(true)}
                className="inline-flex h-7 shrink-0 items-center gap-1 px-0 text-[13px] font-semibold leading-none text-foreground"
                aria-label="필터 열기"
              >
                <span>필터</span>
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              </AppButton>

              <div className="flex shrink-0 items-center gap-2">
                <span className="text-[13px] font-semibold leading-5 text-muted-foreground">
                  잔액표시
                </span>
                <Switch checked={showBalance} onCheckedChange={setShowBalance} />
              </div>
            </div>

            <div className="mt-5 space-y-6">
              {groupedTransactions.map((group) => (
                <TransactionMonthSection
                  key={group.month}
                  month={group.month}
                  items={group.items}
                  showBalance={showBalance}
                  onItemClick={(transactionId) => navigate(`/transaction-history/${transactionId}`)}
                />
              ))}

              {groupedTransactions.length === 0 && (
                <div className="py-12 text-center text-[14px] font-medium text-muted-foreground">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          </section>
        </div>
      </MobileLayout>

      <TransactionHistoryFilterSheet
        isOpen={isFilterOpen}
        selectedPeriod={selectedPeriod}
        selectedType={selectedType}
        selectedSort={selectedSort}
        searchKeyword={searchKeyword}
        customDateFrom={customDateFrom}
        customDateTo={customDateTo}
        onClose={() => setFilterOpen(false)}
        onApply={() => setFilterOpen(false)}
        onSelectPeriod={setSelectedPeriod}
        onSelectType={setSelectedType}
        onSelectSort={setSelectedSort}
        onSearchKeywordChange={setSearchKeyword}
        onCustomDateFromChange={setCustomDateFrom}
        onCustomDateToChange={setCustomDateTo}
      />
    </>
  )
}
