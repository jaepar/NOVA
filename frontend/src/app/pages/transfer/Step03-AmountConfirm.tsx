import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppButton, Btn_1Col } from '../../components/design-system'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useTranslation } from '../../i18n'
import { formatCurrency } from './types'
import { useTransferStore } from './transferStore'
import { TransferAccountSummary } from './components/TransferAccountSummary'

export function TransferAmountConfirm() {
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const amount = useTransferStore((state) => state.amount)
  const preview = useTransferStore((state) => state.preview)
  const recipientMemoName = useTransferStore((state) => state.recipientMemoName)
  const senderMemoName = useTransferStore((state) => state.senderMemoName)
  const amountText = formatCurrency(amount, language)
  const balanceText = formatCurrency(String(preview?.myAccount.balance ?? 0), language)

  return (
    <MobileLayout
      title={t('transfer.title')}
      titleKey="transfer.title"
      headerType="back"
      onBack={() => navigate('/transfer/amount')}
      bottomContent={
        <Btn_1Col onClick={() => navigate('/transfer/review')}>
          {t('transfer.amountConfirm.next')}
        </Btn_1Col>
      }
    >
      <section className="pt-2 text-[#202633]">
        <TransferAccountSummary />
        <AppButton
          type="button"
          variant="unstyled"
          onClick={() => navigate('/transfer/amount')}
          className="mt-16 block w-full text-center"
        >
          <h2 className="text-[36px] font-bold leading-tight text-[#050B2D]">{amountText}</h2>
          <p className="mt-2 text-[16px] font-semibold text-[#30343B]">
            {t('transfer.amountConfirm.withdrawable')} {balanceText}
          </p>
        </AppButton>

        <div className="mt-32 space-y-8 text-[16px] font-bold text-[#202633]">
          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => navigate('/transfer/memo/recipient')}
            className="flex w-full items-center justify-between text-left"
          >
            <span>{t('transfer.amountConfirm.recipientMemo')}</span>
            <span className="flex items-center gap-3 text-[#59606A]">
              {recipientMemoName}
              <ChevronRight className="h-5 w-5" />
            </span>
          </AppButton>
          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => navigate('/transfer/memo/sender')}
            className="flex w-full items-center justify-between text-left"
          >
            <span>{t('transfer.amountConfirm.senderMemo')}</span>
            <span className="flex items-center gap-3 text-[#59606A]">
              {senderMemoName}
              <ChevronRight className="h-5 w-5" />
            </span>
          </AppButton>
        </div>
      </section>
    </MobileLayout>
  )
}
