import type { WalletTransactionFlow } from "../../../../api";

export type WalletTransaction = {
  id: string
  transactionFlow: WalletTransactionFlow
  month: string
  date: string
  time: string
  title: string
  amount: number
}

export type WalletTransactionFilter = 'all' | 'charge' | 'use'

export const walletBalance = 3220000

const baseWalletTransactions: WalletTransaction[] = [
  {
    id: 'tx-20260110',
    transactionFlow: 'DEPOSIT',
    month: '2026년 1월',
    date: '1월 10일',
    time: '20:09:41',
    title: '월렛 충전',
    amount: 20000,
  },
  {
    id: 'tx-20260109',
    transactionFlow: 'WITHDRAWAL',
    month: '2026년 1월',
    date: '1월 9일',
    time: '11:02:29',
    title: '스타벅스 강남역점',
    amount: -30000,
  },
  {
    id: 'tx-20260107',
    transactionFlow: 'WITHDRAWAL',
    month: '2026년 1월',
    date: '1월 7일',
    time: '12:00:32',
    title: '파리바게뜨 역삼점',
    amount: -30000,
  },
  {
    id: 'tx-20260106',
    transactionFlow: 'DEPOSIT',
    month: '2026년 1월',
    date: '1월 6일',
    time: '15:30:11',
    title: '월렛 충전',
    amount: 10000,
  },
  {
    id: 'tx-20260105',
    transactionFlow: 'WITHDRAWAL',
    month: '2026년 1월',
    date: '1월 5일',
    time: '09:15:07',
    title: '신분당선 강남역',
    amount: -2600,
  },
  {
    id: 'tx-20260103',
    transactionFlow: 'WITHDRAWAL',
    month: '2026년 1월',
    date: '1월 3일',
    time: '16:45:23',
    title: 'CU 역삼센터점',
    amount: -15000,
  },
]

const mockMerchants = [
  '월렛 충전',
  '스타벅스 강남역점',
  '파리바게뜨 역삼점',
  '신분당선 강남역',
  'CU 역삼센터점',
  'GS25 논현타워점',
  '올리브영 역삼점',
  '배달의민족',
  '메가커피 선릉점',
  '공항철도',
]

function createMockTransaction(index: number): WalletTransaction {
  const day = 28 - (index % 26)
  const monthNumber = index < 18 ? 1 : 12
  const month = monthNumber === 1 ? '2026년 1월' : '2025년 12월'
  const isCharge = index % 4 === 0
  const amount = isCharge
    ? [10000, 20000, 30000, 50000][index % 4]
    : -[2600, 4800, 9800, 12500, 15000, 30000][index % 6]

  return {
    id: `tx-mock-${index}`,
    transactionFlow: isCharge ? 'DEPOSIT' : 'WITHDRAWAL',
    month,
    date: `${monthNumber}월 ${day}일`,
    time: `${String(9 + (index % 12)).padStart(2, '0')}:${String((index * 7) % 60).padStart(
      2,
      '0',
    )}:${String((index * 13) % 60).padStart(2, '0')}`,
    title: mockMerchants[index % mockMerchants.length],
    amount,
  }
}

export const walletTransactions: WalletTransaction[] = [
  ...baseWalletTransactions,
  ...Array.from({ length: 30 }, (_, index) => createMockTransaction(index + 1)),
]

export const walletTransactionFilterLabels: Record<WalletTransactionFilter, string> = {
  all: '전체',
  charge: '충전',
  use: '사용',
}
