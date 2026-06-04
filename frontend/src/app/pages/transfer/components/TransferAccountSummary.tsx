import { SOURCE_ACCOUNT, SOURCE_BANK, RECIPIENT_NAME, BANK_OPTIONS } from '../types'
import { useTransferStore } from '../transferStore'
import { BankMark } from './BankMark'

export function TransferAccountSummary() {
  const accountNumber = useTransferStore((state) => state.accountNumber)
  const selectedBank = useTransferStore((state) => state.selectedBank)
  const recipientBank = selectedBank ?? BANK_OPTIONS.find((bank) => bank.id === 'nonghyup') ?? BANK_OPTIONS[0]
  const recipientAccount = accountNumber || '1122261925003'

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-[16px] font-bold text-[#202633]">
          <BankMark bank={SOURCE_BANK} size="md" />
          <span>우리은행 계좌에서</span>
        </div>
        <p className="mt-1 text-[13px] font-semibold text-[#8A9099]">
          우리SUPER주거래통장 {SOURCE_ACCOUNT}
        </p>
      </div>
      <div>
        <div className="flex items-center gap-2 text-[16px] font-bold text-[#202633]">
          <BankMark bank={recipientBank} size="md" />
          <span>{RECIPIENT_NAME} 님 계좌로</span>
        </div>
        <p className="mt-1 text-[13px] font-semibold text-[#8A9099]">
          {recipientBank.name.replace('은행', '')} {recipientAccount}
        </p>
      </div>
    </div>
  )
}
