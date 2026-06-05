import { create } from 'zustand'

interface TransactionHistoryStore {
  selectedPeriod: string
  selectedType: string
  selectedSort: string
  searchKeyword: string
  showBalance: boolean
  customDateFrom: string
  customDateTo: string
  memoByTransactionId: Record<string, string>
  setSelectedPeriod: (period: string) => void
  setSelectedType: (type: string) => void
  setSelectedSort: (sort: string) => void
  setSearchKeyword: (keyword: string) => void
  setShowBalance: (showBalance: boolean) => void
  setCustomDateFrom: (value: string) => void
  setCustomDateTo: (value: string) => void
  setTransactionMemo: (transactionId: string, memo: string) => void
}

export const useTransactionHistoryStore = create<TransactionHistoryStore>((set) => ({
  selectedPeriod: '1개월',
  selectedType: '전체',
  selectedSort: '최신순',
  searchKeyword: '',
  showBalance: true,
  customDateFrom: '',
  customDateTo: '',
  memoByTransactionId: {},
  setSelectedPeriod: (selectedPeriod) => set({ selectedPeriod }),
  setSelectedType: (selectedType) => set({ selectedType }),
  setSelectedSort: (selectedSort) => set({ selectedSort }),
  setSearchKeyword: (searchKeyword) => set({ searchKeyword }),
  setShowBalance: (showBalance) => set({ showBalance }),
  setCustomDateFrom: (customDateFrom) => set({ customDateFrom }),
  setCustomDateTo: (customDateTo) => set({ customDateTo }),
  setTransactionMemo: (transactionId, memo) =>
    set((state) => ({
      memoByTransactionId: {
        ...state.memoByTransactionId,
        [transactionId]: memo,
      },
    })),
}))
