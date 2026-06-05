import type { AccountTransaction } from './types'

export function formatWon(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`
}

export function getMonthLabel(date: string) {
  const [year, month] = date.split('.')
  return `${year}년 ${Number(month)}월`
}

export function parseTransactionDate(date: string): Date {
  const [year, month, day] = date.split('.').map(Number)
  return new Date(year, month - 1, day)
}

export function parseTransactionDateTime(dateTime: string): Date {
  const [datePart, timePart] = dateTime.split(' ')
  const [year, month, day] = datePart.split('.').map(Number)
  const [hours, minutes, seconds] = timePart.split(':').map(Number)
  return new Date(year, month - 1, day, hours, minutes, seconds)
}

export function groupTransactionsByMonth(transactions: AccountTransaction[]) {
  const map = new Map<string, AccountTransaction[]>()
  for (const transaction of transactions) {
    const month = getMonthLabel(transaction.date)
    const existing = map.get(month)
    if (existing) {
      existing.push(transaction)
    } else {
      map.set(month, [transaction])
    }
  }
  return Array.from(map.entries()).map(([month, items]) => ({ month, items }))
}
