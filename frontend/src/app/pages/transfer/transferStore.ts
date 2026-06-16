import { create } from 'zustand'
import { type BankOption, type TransferPreview } from './types'

interface TransferState {
  accountNumber: string
  selectedBank: BankOption | null
  preview: TransferPreview | null
  amount: string
  recipientMemoName: string
  senderMemoName: string
  setAccountNumber: (accountNumber: string) => void
  setSelectedBank: (bank: BankOption | null) => void
  setPreview: (preview: TransferPreview | null) => void
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
  preview: null,
  amount: '',
  recipientMemoName: '',
  senderMemoName: '',
}

export const useTransferStore = create<TransferState>((set) => ({
  ...initialState,
  setAccountNumber: (accountNumber) => set({ accountNumber, preview: null, amount: '' }),
  setSelectedBank: (selectedBank) => set({ selectedBank, preview: null, amount: '' }),
  setPreview: (preview) =>
    set((state) => ({
      preview,
      recipientMemoName: preview?.myAccount.userName ?? state.recipientMemoName,
      senderMemoName: preview?.recipient.recipientName ?? state.senderMemoName,
    })),
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
