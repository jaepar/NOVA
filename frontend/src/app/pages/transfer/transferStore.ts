import { create } from 'zustand'
import { type BankOption, RECIPIENT_NAME } from './types'

interface TransferState {
  accountNumber: string
  selectedBank: BankOption | null
  amount: string
  recipientMemoName: string
  senderMemoName: string
  setAccountNumber: (accountNumber: string) => void
  setSelectedBank: (bank: BankOption | null) => void
  setAmount: (amount: string) => void
  appendAmount: (value: string) => void
  backspaceAmount: () => void
  setRecipientMemoName: (name: string) => void
  setSenderMemoName: (name: string) => void
  resetTransfer: () => void
}

const initialState = {
  accountNumber: '',
  selectedBank: null,
  amount: '',
  recipientMemoName: RECIPIENT_NAME,
  senderMemoName: RECIPIENT_NAME,
}

export const useTransferStore = create<TransferState>((set) => ({
  ...initialState,
  setAccountNumber: (accountNumber) => set({ accountNumber }),
  setSelectedBank: (selectedBank) => set({ selectedBank }),
  setAmount: (amount) => set({ amount }),
  appendAmount: (value) =>
    set((state) => {
      const next = `${state.amount}${value}`.replace(/^0+/, '')
      return { amount: next.slice(0, 9) }
    }),
  backspaceAmount: () => set((state) => ({ amount: state.amount.slice(0, -1) })),
  setRecipientMemoName: (recipientMemoName) => set({ recipientMemoName }),
  setSenderMemoName: (senderMemoName) => set({ senderMemoName }),
  resetTransfer: () => set(initialState),
}))
