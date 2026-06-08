import type { AccountTransaction } from './types'
import type {
  AccountSummary,
  BankingTransaction,
  GetTransactionsParams,
  TransactionFlowFilter,
  TransactionPeriod,
  TransactionSortDirection,
  TransactionType,
} from '../../../api/endpoints/banking'
import type { AccountInfo } from './types'

export function formatWon(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`
}

export function getMonthLabel(date: string) {
  const [year, month] = date.split('.')
  return `${year}년 ${Number(month)}월`
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

export function toAccountInfo(account: AccountSummary): AccountInfo {
  return {
    accountId: account.accountId,
    isLimited: account.hasLimit,
    name: account.accountName,
    number: `${account.bankName} ${account.accountNumber}`,
    balance: account.balance,
    availableBalance: account.balance,
  }
}

export function toAccountTransaction(transaction: BankingTransaction): AccountTransaction {
  const dateTime = formatTransactionDateTime(transaction.transactionDateTime)
  const amount =
    transaction.transactionFlow === 'WITHDRAWAL'
      ? -Math.abs(transaction.amount)
      : Math.abs(transaction.amount)

  return {
    id: String(transaction.transactionId),
    transactionId: transaction.transactionId,
    title: transaction.counterParty,
    counterParty: transaction.counterParty,
    type: formatTransactionType(transaction.transactionType),
    amount,
    date: dateTime.slice(0, 10),
    dateTime,
    balanceAfter: transaction.balanceAfter,
    memo: transaction.memo ?? '',
  }
}

export function createTransactionQuery({
  selectedPeriod,
  selectedType,
  selectedSort,
  searchKeyword,
  customDateFrom,
  customDateTo,
  page,
  size,
}: {
  selectedPeriod: string
  selectedType: string
  selectedSort: string
  searchKeyword: string
  customDateFrom: string
  customDateTo: string
  page: number
  size: number
}): GetTransactionsParams {
  const period = mapPeriod(selectedPeriod)
  const query: GetTransactionsParams = {
    period,
    flow: mapFlow(selectedType),
    keyword: searchKeyword.trim() || undefined,
    sortDirection: mapSortDirection(selectedSort),
    page,
    size,
  }

  if (period === 'CUSTOM') {
    query.from = customDateFrom
    query.to = customDateTo
  }

  return query
}

export function isValidTransactionDateRange(
  selectedPeriod: string,
  customDateFrom: string,
  customDateTo: string
) {
  if (mapPeriod(selectedPeriod) !== 'CUSTOM') {
    return true
  }
  if (!customDateFrom || !customDateTo) {
    return false
  }
  return customDateFrom <= customDateTo
}

function mapPeriod(period: string): TransactionPeriod {
  if (period === '1주일') return 'ONE_WEEK'
  if (period === '직접입력') return 'CUSTOM'
  return 'ONE_MONTH'
}

function mapFlow(type: string): TransactionFlowFilter {
  if (type === '입금') return 'DEPOSIT'
  if (type === '출금') return 'WITHDRAWAL'
  return 'ALL'
}

function mapSortDirection(sort: string): TransactionSortDirection {
  return sort === '과거순' ? 'ASC' : 'DESC'
}

function formatTransactionType(type: TransactionType) {
  const labels: Record<TransactionType, string> = {
    SMART_WITHDRAWAL: '스마트 출금',
    CASH_IC: '현금 IC 거래',
    CHECK_CARD: '체크카드',
    ACCOUNT_TRANSFER: '계좌 이체',
    ATM_WITHDRAWAL: 'ATM 출금',
    ATM_DEPOSIT: 'ATM 입금',
    AUTO_DEBIT: '자동이체',
    WALLET_CHARGE: '월렛 충전',
    FEE: '수수료',
    GLOBAL_REMITTANCE: '해외송금',
    GLOBAL_REMITTANCE_REFUND: '해외송금 거절',
  }

  return labels[type]
}

function formatTransactionDateTime(value: string) {
  const [datePart, timePart = '00:00:00'] = value.split('T')
  return `${datePart.replaceAll('-', '.')} ${timePart.slice(0, 8)}`
}
