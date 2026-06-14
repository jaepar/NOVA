import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Btn_1Col } from '../../components/design-system'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useTranslation } from '../../i18n'
import { BANK_OPTIONS, formatCurrency, getShortTransferBankName, RECIPIENT_NAME } from './types'
import { useTransferStore } from './transferStore'

export function TransferComplete() {
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const accountNumber = useTransferStore((state) => state.accountNumber)
  const selectedBank = useTransferStore((state) => state.selectedBank)
  const preview = useTransferStore((state) => state.preview)
  const amount = useTransferStore((state) => state.amount)
  const resetTransfer = useTransferStore((state) => state.resetTransfer)
  const recipientBank = selectedBank ?? BANK_OPTIONS.find((bank) => bank.id === 'nonghyup') ?? BANK_OPTIONS[0]
  const recipientAccount = accountNumber || '1122261925003'
  const recipientName = preview?.recipient.recipientName ?? RECIPIENT_NAME
  const amountText = formatCurrency(amount, language)

  const goMain = () => {
    resetTransfer()
    navigate('/main')
  }

  return (
    <MobileLayout
      title={t('transfer.title')}
      titleKey="transfer.title"
      headerType="none"
      bottomContent={<Btn_1Col onClick={goMain}>{t('common.confirm')}</Btn_1Col>}
    >
      <section className="pt-20 text-center text-[#30343B]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#3F7FF0]">
          <Check className="h-9 w-9 text-white" strokeWidth={4} />
        </div>
        <h2 className="mt-8 whitespace-pre-line text-[24px] font-bold leading-snug">
          {t('transfer.completeTask').replace('{name}', recipientName)}
        </h2>
        <div className="mt-12 rounded-2xl bg-[#F7F7F8] px-6 py-5 text-[15px]">
          <div className="grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-x-4 py-2">
            <span className="whitespace-nowrap text-[#7B828C]">{t('transfer.recipientAccount')}</span>
            <span className="min-w-0 text-right font-bold">
              {getShortTransferBankName(recipientBank, language)} {recipientAccount}
            </span>
          </div>
          <div className="grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-x-4 py-2">
            <span className="whitespace-nowrap text-[#7B828C]">{t('transfer.amount')}</span>
            <span className="min-w-0 text-right font-bold">{amountText}</span>
          </div>
        </div>
      </section>
    </MobileLayout>
  )
}
