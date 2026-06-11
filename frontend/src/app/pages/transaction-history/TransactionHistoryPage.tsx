import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { AppButton } from '../../components/design-system/AppButton'
import { Switch } from '../../components/ui/switch'
import { useTransactionHistoryStore } from './store'
import { groupTransactionsByMonth } from './utils'
import { AccountSummaryCard } from './components/AccountSummaryCard'
import { TransactionMonthSection } from './components/TransactionMonthSection'
import { TransactionHistoryFilterSheet } from './components/TransactionHistoryFilterSheet'

interface TransactionFilterDraft {
  selectedPeriod: string
  selectedType: string
  selectedSort: string
  searchKeyword: string
  customDateFrom: string
  customDateTo: string
}

export function TransactionHistoryPage() {
  const navigate = useNavigate()
  const [isFilterOpen, setFilterOpen] = useState(false)
  const [filterDraft, setFilterDraft] = useState<TransactionFilterDraft>({
    selectedPeriod: '1개월',
    selectedType: '전체',
    selectedSort: '최신순',
    searchKeyword: '',
    customDateFrom: '',
    customDateTo: '',
  })

  const selectedPeriod = useTransactionHistoryStore((state) => state.selectedPeriod)
  const selectedType = useTransactionHistoryStore((state) => state.selectedType)
  const selectedSort = useTransactionHistoryStore((state) => state.selectedSort)
  const searchKeyword = useTransactionHistoryStore((state) => state.searchKeyword)
  const showBalance = useTransactionHistoryStore((state) => state.showBalance)
  const customDateFrom = useTransactionHistoryStore((state) => state.customDateFrom)
  const customDateTo = useTransactionHistoryStore((state) => state.customDateTo)
  const account = useTransactionHistoryStore((state) => state.account)
  const transactions = useTransactionHistoryStore((state) => state.transactions)
  const page = useTransactionHistoryStore((state) => state.page)
  const hasNext = useTransactionHistoryStore((state) => state.hasNext)
  const isLoading = useTransactionHistoryStore((state) => state.isLoading)
  const errorMessage = useTransactionHistoryStore((state) => state.errorMessage)
  const setSelectedPeriod = useTransactionHistoryStore((state) => state.setSelectedPeriod)
  const setSelectedType = useTransactionHistoryStore((state) => state.setSelectedType)
  const setSelectedSort = useTransactionHistoryStore((state) => state.setSelectedSort)
  const setSearchKeyword = useTransactionHistoryStore((state) => state.setSearchKeyword)
  const setShowBalance = useTransactionHistoryStore((state) => state.setShowBalance)
  const setCustomDateFrom = useTransactionHistoryStore((state) => state.setCustomDateFrom)
  const setCustomDateTo = useTransactionHistoryStore((state) => state.setCustomDateTo)
  const fetchInitialData = useTransactionHistoryStore((state) => state.fetchInitialData)
  const fetchTransactions = useTransactionHistoryStore((state) => state.fetchTransactions)

  useEffect(() => {
    void fetchInitialData()
  }, [fetchInitialData])

  const groupedTransactions = groupTransactionsByMonth(transactions)
  const showEmptyState = !isLoading && !errorMessage && groupedTransactions.length === 0
  const showLastTransactionNotice = !isLoading && transactions.length > 0 && !hasNext
  const openFilterSheet = () => {
    setFilterDraft({
      selectedPeriod,
      selectedType,
      selectedSort,
      searchKeyword,
      customDateFrom,
      customDateTo,
    })
    setFilterOpen(true)
  }

  return (
    <>
      <MobileLayout title="거래내역조회" headerType="back" backPath="/main">
        <div className="-mx-5">
          {account && (
            <AccountSummaryCard account={account} onTransferClick={() => navigate('/transfer')} />
          )}

          <div className="h-2 bg-secondary" />

          <section className="px-5 pb-6 pt-5">
            <div className="flex items-center justify-between gap-4">
              <AppButton
                variant="unstyled"
                onClick={openFilterSheet}
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
              {errorMessage && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-[13px] font-semibold text-destructive">
                  {errorMessage}
                </div>
              )}

              {isLoading && groupedTransactions.length === 0 && (
                <div className="py-12 text-center text-[14px] font-medium text-muted-foreground">
                  거래내역을 불러오는 중입니다.
                </div>
              )}

              {groupedTransactions.map((group) => (
                <TransactionMonthSection
                  key={group.month}
                  month={group.month}
                  items={group.items}
                  showBalance={showBalance}
                  onItemClick={(transactionId) => navigate(`/transaction-history/${transactionId}`)}
                />
              ))}

              {showEmptyState && (
                <div className="py-12 text-center text-[14px] font-medium text-muted-foreground">
                  거래내역이 없습니다.
                </div>
              )}

              {hasNext && (
                <AppButton
                  variant="secondary"
                  onClick={() => void fetchTransactions(page + 1)}
                  disabled={isLoading}
                  className="h-11 w-full rounded-lg text-[14px] font-semibold"
                >
                  {isLoading ? '불러오는 중' : '더보기'}
                </AppButton>
              )}

              {showLastTransactionNotice && (
                <div className="py-4 text-center text-[13px] font-semibold text-muted-foreground">
                  마지막 거래내역입니다.
                </div>
              )}
            </div>
          </section>
        </div>
      </MobileLayout>

      <TransactionHistoryFilterSheet
        isOpen={isFilterOpen}
        selectedPeriod={filterDraft.selectedPeriod}
        selectedType={filterDraft.selectedType}
        selectedSort={filterDraft.selectedSort}
        searchKeyword={filterDraft.searchKeyword}
        customDateFrom={filterDraft.customDateFrom}
        customDateTo={filterDraft.customDateTo}
        onClose={() => setFilterOpen(false)}
        onApply={() => {
          setSelectedPeriod(filterDraft.selectedPeriod)
          setSelectedType(filterDraft.selectedType)
          setSelectedSort(filterDraft.selectedSort)
          setSearchKeyword(filterDraft.searchKeyword)
          setCustomDateFrom(filterDraft.customDateFrom)
          setCustomDateTo(filterDraft.customDateTo)
          setFilterOpen(false)
          void fetchTransactions(0)
        }}
        onSelectPeriod={(selectedPeriod) =>
          setFilterDraft((draft) => ({ ...draft, selectedPeriod }))
        }
        onSelectType={(selectedType) =>
          setFilterDraft((draft) => ({ ...draft, selectedType }))
        }
        onSelectSort={(selectedSort) =>
          setFilterDraft((draft) => ({ ...draft, selectedSort }))
        }
        onSearchKeywordChange={(searchKeyword) =>
          setFilterDraft((draft) => ({ ...draft, searchKeyword }))
        }
        onCustomDateFromChange={(customDateFrom) =>
          setFilterDraft((draft) => ({ ...draft, customDateFrom }))
        }
        onCustomDateToChange={(customDateTo) =>
          setFilterDraft((draft) => ({ ...draft, customDateTo }))
        }
      />
    </>
  )
}
