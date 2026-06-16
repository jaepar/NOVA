import { useTranslation } from '../../../i18n'
import { SOURCE_BANK, getShortTransferBankName } from '../types'
import { useTransferStore } from '../transferStore'
import { BankMark } from './BankMark'

export function TransferAccountSummary() {
  const { t, language } = useTranslation()
  const accountNumber = useTransferStore((state) => state.accountNumber)
  const selectedBank = useTransferStore((state) => state.selectedBank)
  const preview = useTransferStore((state) => state.preview)
  const sourceAccountName = preview?.myAccount.accountName ?? ''
  const sourceAccountNumber = preview?.myAccount.accountNumber ?? ''
  const recipientName = preview?.recipient.recipientName ?? ''
  const recipientBankName = selectedBank ? getShortTransferBankName(selectedBank, language) : ''

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-[16px] font-bold text-[#202633]">
          <BankMark bank={SOURCE_BANK} size="md" />
          <span>{t('transfer.accountSummary.fromAccount')}</span>
        </div>
        <p className="mt-1 text-[13px] font-semibold text-[#8A9099]">
          {sourceAccountName} {sourceAccountNumber}
        </p>
      </div>
      <div>
        <div className="flex items-center gap-2 text-[16px] font-bold text-[#202633]">
          {selectedBank ? <BankMark bank={selectedBank} size="md" /> : null}
          <span>
            {t('transfer.accountSummary.toAccount').replace(
              '{name}',
              recipientName
            )}
          </span>
        </div>
        <p className="mt-1 text-[13px] font-semibold text-[#8A9099]">
          {recipientBankName} {accountNumber}
        </p>
      </div>
    </div>
  )
}
