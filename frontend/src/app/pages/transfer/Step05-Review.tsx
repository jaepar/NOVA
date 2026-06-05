import { useState } from 'react'
import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppButton } from '../../components/design-system'
import { BottomSheet } from '../../components/layout/BottomSheet'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { BANK_OPTIONS, formatCurrency, RECIPIENT_NAME, SOURCE_BANK } from './types'
import { useTransferStore } from './transferStore'
import { BankMark } from './components/BankMark'
import { NumericKeypad } from './components/NumericKeypad'

export function TransferReview() {
  const navigate = useNavigate()
  const accountNumber = useTransferStore((state) => state.accountNumber)
  const selectedBank = useTransferStore((state) => state.selectedBank)
  const amount = useTransferStore((state) => state.amount)
  const recipientMemoName = useTransferStore((state) => state.recipientMemoName)
  const senderMemoName = useTransferStore((state) => state.senderMemoName)
  const recipientBank = selectedBank ?? BANK_OPTIONS.find((bank) => bank.id === 'nonghyup') ?? BANK_OPTIONS[0]
  const recipientAccount = accountNumber || '1122261925003'
  const amountText = formatCurrency(amount)
  const [isPasswordSheetOpen, setIsPasswordSheetOpen] = useState(false)
  const [password, setPassword] = useState('')

  const handlePasswordPress = (value: string) => {
    setPassword((current) => {
      if (current.length >= 4) return current

      const next = `${current}${value}`.slice(0, 4)
      if (next.length === 4) {
        window.setTimeout(() => {
          setIsPasswordSheetOpen(false)
          navigate('/transfer/complete')
        }, 150)
      }
      return next
    })
  }

  return (
    <>
      <MobileLayout
        title="이체"
        headerType="back"
        onBack={() => navigate('/transfer/amount-confirm')}
        bottomContent={
          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => {
              setPassword('')
              setIsPasswordSheetOpen(true)
            }}
            className="h-[54px] w-full rounded-lg bg-[#2F80ED] text-[17px] font-semibold text-white"
          >
            이체
          </AppButton>
        }
      >
        <section className="pt-12 text-[#202633]">
          <div className="flex items-center gap-7">
            <BankMark bank={SOURCE_BANK} size="lg" />
            <BankMark bank={recipientBank} size="lg" />
          </div>

          <h2 className="mt-9 text-[24px] font-bold leading-snug">
            <span className="text-[#006BFF]">{RECIPIENT_NAME}</span> 님에게
            <br />
            <span className="text-[#006BFF]">{amountText}</span>을 이체하시겠어요?
          </h2>
          <p className="mt-4 text-[14px] font-semibold text-[#8A9099]">
            {recipientBank.name.replace('은행', '')} {recipientAccount} 계좌로 보냅니다.
          </p>

          <div className="mt-8 rounded-2xl bg-[#F7F7F8] px-5 py-5 text-[15px]">
            <div className="flex justify-between py-2">
              <span className="text-[#7B828C]">받는 분 통장표기</span>
              <span className="font-bold">{recipientMemoName}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#7B828C]">내 통장표기</span>
              <span className="font-bold">{senderMemoName}</span>
            </div>
          </div>
        </section>
      </MobileLayout>

      <BottomSheet
        isOpen={isPasswordSheetOpen}
        onClose={() => setIsPasswordSheetOpen(false)}
        title=""
        height="500px"
        disableScroll
      >
        <div className="relative text-center text-[#30343B]">
          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => setIsPasswordSheetOpen(false)}
            className="absolute right-0 top-0 text-[34px] leading-none"
          >
            ×
          </AppButton>
          <h2 className="pt-8 text-[20px] font-bold">계좌 비밀번호</h2>
          <div className="mt-12 flex justify-center gap-5">
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={`h-4 w-4 rounded-full border border-[#6D7680] ${
                  password.length > index ? 'bg-[#30343B]' : 'bg-white'
                }`}
              />
            ))}
          </div>
          <div className="mt-12">
            <NumericKeypad
              showClear
              onPress={handlePasswordPress}
              onClear={() => setPassword('')}
              onBackspace={() => setPassword((current) => current.slice(0, -1))}
            />
          </div>
        </div>
      </BottomSheet>
    </>
  )
}
