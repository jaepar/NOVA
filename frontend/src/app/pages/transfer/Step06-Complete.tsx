import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppButton } from '../../components/design-system'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { BANK_OPTIONS, formatCurrency, RECIPIENT_NAME } from './types'
import { useTransferStore } from './transferStore'

export function TransferComplete() {
  const navigate = useNavigate()
  const accountNumber = useTransferStore((state) => state.accountNumber)
  const selectedBank = useTransferStore((state) => state.selectedBank)
  const amount = useTransferStore((state) => state.amount)
  const resetTransfer = useTransferStore((state) => state.resetTransfer)
  const recipientBank = selectedBank ?? BANK_OPTIONS.find((bank) => bank.id === 'nonghyup') ?? BANK_OPTIONS[0]
  const recipientAccount = accountNumber || '1122261925003'
  const amountText = formatCurrency(amount)

  const goMain = () => {
    resetTransfer()
    navigate('/main')
  }

  return (
    <MobileLayout
      title="이체"
      headerType="none"
      bottomContent={
        <AppButton
          type="button"
          variant="unstyled"
          onClick={goMain}
          className="h-[54px] w-full rounded-lg bg-[#2F80ED] text-[17px] font-semibold text-white"
        >
          확인
        </AppButton>
      }
    >
      <section className="pt-20 text-center text-[#30343B]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#3F7FF0]">
          <Check className="h-9 w-9 text-white" strokeWidth={4} />
        </div>
        <h2 className="mt-8 text-[24px] font-bold leading-snug">
          {RECIPIENT_NAME} 님에게
          <br />
          이체했어요
        </h2>
        <div className="mt-12 rounded-2xl bg-[#F7F7F8] px-6 py-5 text-[15px]">
          <div className="flex justify-between py-2">
            <span className="text-[#7B828C]">받는 계좌</span>
            <span className="font-bold">
              {recipientBank.name.replace('은행', '')} {recipientAccount}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[#7B828C]">이체금액</span>
            <span className="font-bold">{amountText}</span>
          </div>
        </div>
      </section>
    </MobileLayout>
  )
}
