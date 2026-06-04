import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppButton } from '../../components/design-system'
import { BottomSheet } from '../../components/layout/BottomSheet'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { formatCurrency } from './types'
import { useTransferStore } from './transferStore'
import { NumericKeypad } from './components/NumericKeypad'
import { TransferAccountSummary } from './components/TransferAccountSummary'

export function TransferAmount() {
  const navigate = useNavigate()
  const amount = useTransferStore((state) => state.amount)
  const setAmount = useTransferStore((state) => state.setAmount)
  const appendAmount = useTransferStore((state) => state.appendAmount)
  const backspaceAmount = useTransferStore((state) => state.backspaceAmount)
  const [isAmountKeypadOpen, setIsAmountKeypadOpen] = useState(false)
  const amountText = formatCurrency(amount)
  const hasTransferAmount = Number(amount) > 0

  useEffect(() => {
    setIsAmountKeypadOpen(true)
  }, [])

  return (
    <>
      <MobileLayout title="이체" headerType="back" onBack={() => navigate('/transfer')}>
        <section className="pt-2 text-[#202633]">
          <TransferAccountSummary />

          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => setIsAmountKeypadOpen(true)}
            className="mt-16 block w-full text-center"
          >
            {amount ? (
              <>
                <h2 className="text-[42px] font-bold leading-tight text-[#050B2D]">
                  {amountText}
                </h2>
                <p className="mt-3 text-[18px] font-semibold text-[#30343B]">
                  출금 가능 금액 {amountText}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-[28px] font-bold text-[#8C929B]">
                  얼마를 이체하시겠어요?
                </h2>
                <p className="mt-5 text-[17px] font-semibold text-[#8C929B]">출금 가능 금액 0원</p>
              </>
            )}
          </AppButton>
        </section>
      </MobileLayout>

      <BottomSheet
        isOpen={isAmountKeypadOpen}
        onClose={() => setIsAmountKeypadOpen(false)}
        title=""
        height="410px"
        disableScroll
        dimBackground={false}
      >
        <div className="flex h-full flex-col">
          <div className="grid grid-cols-5 gap-2">
            {['+1만', '+5만', '+10만', '+100만', '전액'].map((chip) => (
              <AppButton
                key={chip}
                type="button"
                variant="unstyled"
                onClick={() => setAmount(chip === '전액' ? '1000000' : chip.replace(/\D/g, '0000'))}
                className="h-9 rounded-md bg-[#F1F3F5] text-[13px] font-bold text-[#454B52]"
              >
                {chip}
              </AppButton>
            ))}
          </div>
          <div className="mt-7">
            <NumericKeypad onPress={appendAmount} onBackspace={backspaceAmount} />
          </div>
          <AppButton
            type="button"
            variant="unstyled"
            disabled={!hasTransferAmount}
            onClick={() => {
              setIsAmountKeypadOpen(false)
              navigate('/transfer/amount-confirm')
            }}
            className="mt-auto h-[58px] w-full rounded-xl bg-[#006BFF] text-[18px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-[#BFDAFA]"
          >
            확인
          </AppButton>
        </div>
      </BottomSheet>
    </>
  )
}
