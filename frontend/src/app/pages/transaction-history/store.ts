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
  detailTransaction: AccountTransaction | null
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
  fetchTransactionForDetail: (transactionId: string | undefined) => Promise<void>
  updateTransactionMemo: (transactionId: number, memo: string) => Promise<void>
  findTransaction: (transactionId: string | undefined) => AccountTransaction | undefined
}

export const useTransactionHistoryStore = create<TransactionHistoryStore>((set, get) => ({
  selectedPeriod: 'ONE_MONTH',
  selectedType: 'ALL',
  selectedSort: 'DESC',
  searchKeyword: '',
  showBalance: true,
  customDateFrom: '',
  customDateTo: '',
  account: null,
  transactions: [],
  detailTransaction: null,
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
      set({ errorMessage: 'transactionHistory.loadError', isLoading: false })
    }
  },
  fetchTransactions: async (nextPage = 0) => {
    if (nextPage > 0 && get().isLoading) {
      return
    }

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
        errorMessage: 'transactionHistory.dateRangeError',
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
      set((current) => {
        const existingIds = new Set(current.transactions.map((transaction) => transaction.id))
        const nextTransactions =
          nextPage === 0
            ? transactions
            : [
                ...current.transactions,
                ...transactions.filter((transaction) => !existingIds.has(transaction.id)),
              ]

        return {
          transactions: nextTransactions,
          detailTransaction: nextPage === 0 ? null : current.detailTransaction,
          page: response.page,
          hasNext: response.hasNext,
          isLoading: false,
        }
      })
    } catch {
      set({ errorMessage: 'transactionHistory.loadError', isLoading: false })
    }
  },
  fetchTransactionForDetail: async (transactionId) => {
    if (!transactionId || get().findTransaction(transactionId)) {
      return
    }

    set({ isLoading: true, errorMessage: null, detailTransaction: null })
    try {
      let account = get().account
      if (!account) {
        const home = await bankingApi.getHome()
        if (!home.account) {
          set({ isLoading: false })
          return
        }
        account = toAccountInfo(home.account)
        set({ account })
      }

      const state = get()
      const useCurrentDateRange = isValidTransactionDateRange(
        state.selectedPeriod,
        state.customDateFrom,
        state.customDateTo
      )
      const selectedPeriod = useCurrentDateRange ? state.selectedPeriod : 'ONE_MONTH'
      const customDateFrom = useCurrentDateRange ? state.customDateFrom : ''
      const customDateTo = useCurrentDateRange ? state.customDateTo : ''
      let nextPage = 0
      let hasNextPage = true

      while (hasNextPage) {
        const response = await bankingApi.getTransactions(
          account.accountId,
          createTransactionQuery({
            selectedPeriod,
            selectedType: 'ALL',
            selectedSort: state.selectedSort,
            searchKeyword: '',
            customDateFrom,
            customDateTo,
            page: nextPage,
            size: DEFAULT_PAGE_SIZE,
          })
        )
        const matchedTransaction = response.transactions.find(
          (transaction) => String(transaction.transactionId) === transactionId
        )

        if (matchedTransaction) {
          set({
            detailTransaction: toAccountTransaction(matchedTransaction),
            isLoading: false,
          })
          return
        }

        hasNextPage = response.hasNext
        nextPage += 1
      }

      set({ isLoading: false })
    } catch {
      set({ errorMessage: 'transactionHistory.loadError', isLoading: false })
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
        detailTransaction:
          state.detailTransaction?.transactionId === transactionId
            ? { ...state.detailTransaction, memo: normalizedMemo }
            : state.detailTransaction,
        transactions: state.transactions.map((transaction) =>
          transaction.transactionId === transactionId
            ? { ...transaction, memo: normalizedMemo }
            : transaction
        ),
        isUpdatingMemo: false,
      }))
    } catch {
      set({ errorMessage: 'transactionHistory.memoSaveError', isUpdatingMemo: false })
      throw new Error('Failed to update transaction memo')
    }
  },
  findTransaction: (transactionId) => {
    if (!transactionId) return undefined
    const state = get()
    return (
      state.transactions.find((transaction) => transaction.id === transactionId) ??
      (state.detailTransaction?.id === transactionId ? state.detailTransaction : undefined)
    )
  },
}))
