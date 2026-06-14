import {
  getShortTransferBankName,
  getTransferBankName,
  type TransferBankOption,
  TRANSFER_BANK_OPTIONS,
} from '../../data/accountNumberDetector'
import type { TransferPreviewResponse } from '../../../api'

export type BankOption = TransferBankOption
export type MemoType = 'recipient' | 'sender'

export const BANK_OPTIONS = TRANSFER_BANK_OPTIONS as BankOption[]
export { getShortTransferBankName, getTransferBankName }
export const REQUIRED_ACCOUNT_LENGTH = 10
export const SOURCE_BANK = BANK_OPTIONS.find((bank) => bank.id === 'woori') ?? BANK_OPTIONS[0]
export const SOURCE_ACCOUNT = '1002-867-390781'
export const RECIPIENT_NAME = '백민정'

export const BANK_LOGO_SRC: Record<string, string> = {
  woori: new URL('./assets/woori.png', import.meta.url).href,
  hana: new URL('./assets/hana.png', import.meta.url).href,
  kb: new URL('./assets/kb.png', import.meta.url).href,
  shinhan: new URL('./assets/shinhan.png', import.meta.url).href,
  nonghyup: new URL('./assets/nonghyup.png', import.meta.url).href,
  ibk: new URL('./assets/ibk.png', import.meta.url).href,
  kakao: new URL('./assets/kakao.png', import.meta.url).href,
  toss: new URL('./assets/toss.png', import.meta.url).href,
  sc: new URL('./assets/sc.png', import.meta.url).href,
  busan: new URL('./assets/busan.png', import.meta.url).href,
  kbank: new URL('./assets/kbank.png', import.meta.url).href,
  suhyup: new URL('./assets/suhyup.png', import.meta.url).href,
}

export const BANK_CODE_BY_ID: Record<string, string> = {
  woori: 'WOORI',
  kb: 'KOOKMIN',
  shinhan: 'SHINHAN',
  nonghyup: 'NH',
  hana: 'HANA',
  ibk: 'IBK',
  sc: 'SC',
  busan: 'BUSAN',
  kakao: 'KAKAO',
  toss: 'TOSS',
  kbank: 'KBANK',
  suhyup: 'SUHYUP',
}

export type TransferPreview = TransferPreviewResponse

export function normalizeAccountNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 14)
}

export function formatCurrency(value: string, language = 'ko') {
  const amount = Number(value || '0')
  if (language === 'en') {
    return `KRW ${amount.toLocaleString('en-US')}`
  }
  return `${amount.toLocaleString('ko-KR')}원`
}
