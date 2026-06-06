import { create } from 'zustand'
import { bankingApi } from '../../../api/endpoints/banking'
import type { AccountInfo, AccountTransaction } from './types'
import {
  createTransactionQuery,
  isValidTransactionDateRange,
  toAccountInfo,
  toAccountTransaction,
} from './utils'

const DEFAULT_PAGE_SIZE = 20

interface TransactionHistoryStore {
  selectedPeriod: string
  selectedType: string
  selectedSort: string
  searchKeyword: string
  showBalance: boolean
  customDateFrom: string
  customDateTo: string
  account: AccountInfo | null
  transactions: AccountTransaction[]
  page: number
  hasNext: boolean
  isLoading: boolean
  isUpdatingMemo: boolean
  errorMessage: string | null
  setSelectedPeriod: (period: string) => void
  setSelectedType: (type: string) => void
  setSelectedSort: (sort: string) => void
  setSearchKeyword: (keyword: string) => void
  setShowBalance: (showBalance: boolean) => void
  setCustomDateFrom: (value: string) => void
  setCustomDateTo: (value: string) => void
  fetchInitialData: () => Promise<void>
  fetchTransactions: (nextPage?: number) => Promise<void>
  updateTransactionMemo: (transactionId: number, memo: string) => Promise<void>
  findTransaction: (transactionId: string | undefined) => AccountTransaction | undefined
}

export const useTransactionHistoryStore = create<TransactionHistoryStore>((set, get) => ({
  selectedPeriod: '1개월',
  selectedType: '전체',
  selectedSort: '최신순',
  searchKeyword: '',
  showBalance: true,
  customDateFrom: '',
  customDateTo: '',
  account: null,
  transactions: [],
  page: 0,
  hasNext: false,
  isLoading: false,
  isUpdatingMemo: false,
  errorMessage: null,
  setSelectedPeriod: (selectedPeriod) => set({ selectedPeriod }),
  setSelectedType: (selectedType) => set({ selectedType }),
  setSelectedSort: (selectedSort) => set({ selectedSort }),
  setSearchKeyword: (searchKeyword) => set({ searchKeyword }),
  setShowBalance: (showBalance) => set({ showBalance }),
  setCustomDateFrom: (customDateFrom) => set({ customDateFrom }),
  setCustomDateTo: (customDateTo) => set({ customDateTo }),
  fetchInitialData: async () => {
    set({ isLoading: true, errorMessage: null })
    try {
      const home = await bankingApi.getHome()
      if (!home.account) {
        set({
          account: null,
          transactions: [],
          page: 0,
          hasNext: false,
          isLoading: false,
        })
        return
      }

      const account = toAccountInfo(home.account)
      set({ account })
      await get().fetchTransactions(0)
    } catch {
      set({ errorMessage: '거래내역을 불러오지 못했습니다.', isLoading: false })
    }
  },
  fetchTransactions: async (nextPage = 0) => {
    const state = get()
    const account = state.account
    if (!account) {
      set({ transactions: [], page: 0, hasNext: false, isLoading: false })
      return
    }

    if (!isValidTransactionDateRange(state.selectedPeriod, state.customDateFrom, state.customDateTo)) {
      set({
        transactions: [],
        page: 0,
        hasNext: false,
        isLoading: false,
        errorMessage: '조회 기간을 확인해주세요.',
      })
      return
    }

    set({ isLoading: true, errorMessage: null })
    try {
      const response = await bankingApi.getTransactions(
        account.accountId,
        createTransactionQuery({
          selectedPeriod: state.selectedPeriod,
          selectedType: state.selectedType,
          selectedSort: state.selectedSort,
          searchKeyword: state.searchKeyword,
          customDateFrom: state.customDateFrom,
          customDateTo: state.customDateTo,
          page: nextPage,
          size: DEFAULT_PAGE_SIZE,
        })
      )

      const transactions = response.transactions.map(toAccountTransaction)
      set({
        transactions:
          nextPage === 0 ? transactions : [...get().transactions, ...transactions],
        page: response.page,
        hasNext: response.hasNext,
        isLoading: false,
      })
    } catch {
      set({ errorMessage: '거래내역을 불러오지 못했습니다.', isLoading: false })
    }
  },
  updateTransactionMemo: async (transactionId, memo) => {
    set({ isUpdatingMemo: true, errorMessage: null })
    try {
      const normalizedMemo = memo.trim()
      await bankingApi.updateTransactionMemo(transactionId, {
        memo: normalizedMemo || null,
      })
      set((state) => ({
        transactions: state.transactions.map((transaction) =>
          transaction.transactionId === transactionId
            ? { ...transaction, memo: normalizedMemo }
            : transaction
        ),
        isUpdatingMemo: false,
      }))
    } catch {
      set({ errorMessage: '메모를 저장하지 못했습니다.', isUpdatingMemo: false })
      throw new Error('Failed to update transaction memo')
    }
  },
  findTransaction: (transactionId) => {
    if (!transactionId) return undefined
    return get().transactions.find((transaction) => transaction.id === transactionId)
  },
}))
