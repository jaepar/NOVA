export interface AccountInfo {
  isLimited: boolean
  name: string
  number: string
  balance: number
  availableBalance: number
}

export interface AccountTransaction {
  id: string
  title: string
  counterParty: string
  type: string
  amount: number
  date: string
  dateTime: string
  withdrawalAccount: string
  balanceAfter: number
  memo: string
}
