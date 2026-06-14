export interface AccountInfo {
  accountId: number
  isLimited: boolean
  name: string
  number: string
  balance: number
  availableBalance: number
}

export interface AccountTransaction {
  id: string
  transactionId: number
  title: string
  counterParty: string
  type: string
  rawType: string
  amount: number
  date: string
  dateTime: string
  balanceAfter: number
  memo: string
}
