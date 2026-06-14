import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppButton, Btn_1Col } from '../../components/design-system'
import { BottomSheet } from '../../components/layout/BottomSheet'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useTranslation } from '../../i18n'
import { formatCurrency } from './types'
import { useTransferStore } from './transferStore'
import { NumericKeypad } from './components/NumericKeypad'
import { TransferAccountSummary } from './components/TransferAccountSummary'

const amountChips = [
  { labelKey: 'transfer.amountInput.add10k', value: '10000' },
  { labelKey: 'transfer.amountInput.add50k', value: '50000' },
  { labelKey: 'transfer.amountInput.add100k', value: '100000' },
  { labelKey: 'transfer.amountInput.add1000k', value: '1000000' },
] as const

export function TransferAmount() {
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const amount = useTransferStore((state) => state.amount)
  const preview = useTransferStore((state) => state.preview)
  const setAmount = useTransferStore((state) => state.setAmount)
  const appendAmount = useTransferStore((state) => state.appendAmount)
  const backspaceAmount = useTransferStore((state) => state.backspaceAmount)
  const [isAmountKeypadOpen, setIsAmountKeypadOpen] = useState(false)
  const amountText = formatCurrency(amount, language)
  const balance = preview?.myAccount.balance ?? 0
  const transferLimit = preview?.myAccount.transferLimit ?? 0
  const availableLimit = Math.min(balance, transferLimit)
  const numericAmount = Number(amount || '0')
  const isOverAvailableAmount = numericAmount > availableLimit
  const overAvailableMessage = isOverAvailableAmount
      ? balance > transferLimit
      ? t('transfer.amountInput.overLimit')
      : t('transfer.amountInput.insufficientBalance')
    : ''
  const hasTransferAmount = numericAmount > 0 && !isOverAvailableAmount
  const balanceText = formatCurrency(String(balance), language)

  useEffect(() => {
    setAmount('')
    setIsAmountKeypadOpen(true)
  }, [setAmount])

  return (
    <>
      <MobileLayout
        title={t('transfer.title')}
        titleKey="transfer.title"
        headerType="back"
        onBack={() => navigate('/transfer')}
      >
        <section className="pt-2 text-[#202633]">
          <TransferAccountSummary />

          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => setIsAmountKeypadOpen(true)}
            className="mt-8 block w-full text-center"
          >
            {amount ? (
              <>
                <h2 className="text-[36px] font-bold leading-tight text-[#050B2D]">
                  {amountText}
                </h2>
                <p className="mt-2 text-[16px] font-semibold text-[#30343B]">
                  {t('transfer.amountInput.withdrawable')} {balanceText}
                </p>
                {isOverAvailableAmount ? (
                  <p className="mt-2 text-[13px] font-semibold text-[#EF4444]">
                    {overAvailableMessage}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <h2 className="text-[28px] font-bold text-[#8C929B]">
                  {t('transfer.amountInput.heading')}
                </h2>
                <p className="mt-3 text-[16px] font-semibold text-[#8C929B]">
                  {t('transfer.amountInput.withdrawable')} {balanceText}
                </p>
              </>
            )}
          </AppButton>
        </section>
      </MobileLayout>

      <BottomSheet
        isOpen={isAmountKeypadOpen}
        onClose={() => setIsAmountKeypadOpen(false)}
        title=""
        height="390px"
        disableScroll
        dimBackground={false}
      >
        <div className="flex h-full flex-col">
          <div className="grid grid-cols-5 gap-2">
            {amountChips.map((chip) => (
              <AppButton
                key={chip.value}
                type="button"
                variant="unstyled"
                onClick={() => setAmount(chip.value)}
                className="h-9 rounded-md bg-[#F1F3F5] text-[13px] font-bold text-[#454B52]"
              >
                {t(chip.labelKey)}
              </AppButton>
            ))}
            <AppButton
              type="button"
              variant="unstyled"
              onClick={() => setAmount(String(balance))}
              className="h-9 rounded-md bg-[#F1F3F5] text-[13px] font-bold text-[#454B52]"
            >
              {t('transfer.amountInput.all')}
            </AppButton>
          </div>
          <div className="mt-7">
            <NumericKeypad onPress={appendAmount} onBackspace={backspaceAmount} />
          </div>
          <div className="mt-auto">
            <Btn_1Col
              disabled={!hasTransferAmount}
              onClick={() => {
                setIsAmountKeypadOpen(false)
                navigate('/transfer/amount-confirm')
              }}
            >
              {t('transfer.amountInput.confirm')}
            </Btn_1Col>
          </div>
        </div>
      </BottomSheet>
    </>
  )
}
