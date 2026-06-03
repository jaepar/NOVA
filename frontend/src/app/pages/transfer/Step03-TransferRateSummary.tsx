import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppButton } from '../../components/design-system/AppButton'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { transferCurrencies } from '../../data/transferCurrencies'
import {
  formatForeignAmount,
  formatKrwAmount,
  MOCK_TRANSFER_CABLE_FEE,
  MOCK_TRANSFER_EXCHANGE_RATE,
  MOCK_TRANSFER_TRANSFER_FEE,
} from './transferQuote'
import {
  useTransferBasicInfoPageStore,
  useTransferRecipientInfoPageStore,
  useTransferSenderInfoPageStore,
} from '../../stores/pageStores'

export function Step03TransferRateSummary() {
  const navigate = useNavigate()
  const currencyCode = useTransferBasicInfoPageStore((state) => state.currencyCode)
  const amount = useTransferBasicInfoPageStore((state) => state.amount)
  const resetTransferSenderInfo = useTransferSenderInfoPageStore((state) => state.reset)
  const resetTransferRecipientInfo = useTransferRecipientInfoPageStore((state) => state.reset)
  const selectedCurrency = useMemo(
    () => transferCurrencies.find((item) => item.code === currencyCode) ?? transferCurrencies[0],
    [currencyCode]
  )

  const summaryRows = [
    {
      label: '적용환율',
      value: `KRW ${MOCK_TRANSFER_EXCHANGE_RATE.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      highlight: false,
    },
    {
      label: '송금액',
      value: formatForeignAmount(selectedCurrency.code, amount),
      highlight: false,
    },
    { label: '원화금액', value: formatKrwAmount(amount), highlight: true },
    { label: '송금수수료', value: MOCK_TRANSFER_TRANSFER_FEE, highlight: false },
    { label: '전신료', value: MOCK_TRANSFER_CABLE_FEE, highlight: false },
  ]

  return (
    <MobileLayout
      title="해외송금"
      backPath="/transfer/send/step-02"
      bottomContent={
        <div className="flex w-full gap-4">
          <AppButton
            variant="outline"
            onClick={() => navigate('/transfer/send/step-02')}
            className="flex-1 rounded-xl px-6 py-4"
          >
            이전
          </AppButton>
          <AppButton
            variant="primary"
            onClick={() => {
              resetTransferSenderInfo()
              resetTransferRecipientInfo()
              navigate('/transfer/send/step-04')
            }}
            className="flex-1 rounded-xl px-6 py-4"
          >
            다음
          </AppButton>
        </div>
      }
    >
      <div className="space-y-8 pb-4 pt-3">
        <section className="space-y-2">
          <h1 className="text-[24px] font-semibold leading-tight text-[#132347]">송금 요약 확인</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            환율과 금액 정보는 추후 별도 API 연동 후 실시간으로 반영됩니다.
          </p>
        </section>

        <section className="overflow-hidden rounded-[24px] border border-border bg-background">
          {summaryRows.map((row, index) => (
            <div
              key={row.label}
              className={`flex items-center justify-between gap-4 px-6 py-6 ${
                index !== summaryRows.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <span className="text-[17px] text-muted-foreground">{row.label}</span>
              <span
                className={`text-right text-[18px] font-semibold ${
                  row.highlight ? 'text-primary' : 'text-foreground'
                }`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </section>
      </div>
    </MobileLayout>
  )
}
