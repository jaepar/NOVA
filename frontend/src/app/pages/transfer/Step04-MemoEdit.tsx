import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppButton, Btn_1Col } from '../../components/design-system'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useTranslation } from '../../i18n'
import {
  BANK_OPTIONS,
  getShortTransferBankName,
  RECIPIENT_NAME,
  SOURCE_ACCOUNT,
  SOURCE_BANK,
  type MemoType,
} from './types'
import { useTransferStore } from './transferStore'
import { BankMark } from './components/BankMark'

export function TransferMemoEdit({ type }: { type: MemoType }) {
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const accountNumber = useTransferStore((state) => state.accountNumber)
  const selectedBank = useTransferStore((state) => state.selectedBank)
  const preview = useTransferStore((state) => state.preview)
  const recipientMemoName = useTransferStore((state) => state.recipientMemoName)
  const senderMemoName = useTransferStore((state) => state.senderMemoName)
  const setRecipientMemoName = useTransferStore((state) => state.setRecipientMemoName)
  const setSenderMemoName = useTransferStore((state) => state.setSenderMemoName)
  const recipientBank = selectedBank ?? BANK_OPTIONS.find((bank) => bank.id === 'nonghyup') ?? BANK_OPTIONS[0]
  const recipientAccount = accountNumber || '1122261925003'
  const recipientName = preview?.recipient.recipientName ?? RECIPIENT_NAME
  const sourceAccountName =
    preview?.myAccount.accountName ?? t('transfer.accountSummary.defaultAccountName')
  const sourceAccountNumber = preview?.myAccount.accountNumber ?? SOURCE_ACCOUNT
  const isRecipientMemo = type === 'recipient'
  const [memoDraft, setMemoDraft] = useState(isRecipientMemo ? recipientMemoName : senderMemoName)
  const heading = isRecipientMemo
    ? t('transfer.memoEdit.recipientHeading').replace('{name}', recipientName)
    : t('transfer.memoEdit.senderHeading')
  const bankDescription = isRecipientMemo
    ? `${getShortTransferBankName(recipientBank, language)} ${recipientAccount}`
    : `${sourceAccountName} ${sourceAccountNumber}`

  useEffect(() => {
    setMemoDraft(isRecipientMemo ? recipientMemoName : senderMemoName)
  }, [isRecipientMemo, recipientMemoName, senderMemoName])

  const handleComplete = () => {
    const nextName = memoDraft.trim()
    if (!nextName) return

    if (isRecipientMemo) {
      setRecipientMemoName(nextName)
    } else {
      setSenderMemoName(nextName)
    }

    navigate('/transfer/amount-confirm')
  }

  return (
    <MobileLayout
      title={t('transfer.title')}
      titleKey="transfer.title"
      headerType="back"
      onBack={() => navigate('/transfer/amount-confirm')}
      bottomContent={
        <Btn_1Col
          disabled={!memoDraft.trim()}
          onClick={handleComplete}
        >
          {t('transfer.memoEdit.complete')}
        </Btn_1Col>
      }
    >
      <section className="pt-5 text-[#202633]">
        <div>
          <div className="flex items-center gap-2 text-[16px] font-bold">
            <BankMark bank={isRecipientMemo ? recipientBank : SOURCE_BANK} size="md" />
            <span>{heading}</span>
          </div>
          <p className="mt-2 text-[13px] font-semibold text-[#8A9099]">
            {bankDescription}
          </p>
        </div>

        <div className="mt-10">
          <label htmlFor="transfer-memo-name" className="text-[14px] font-semibold">
            {t('transfer.memoEdit.label')}
          </label>
          <div className="relative mt-3">
            <input
              id="transfer-memo-name"
              type="text"
              value={memoDraft}
              maxLength={10}
              autoFocus
              onChange={(event) => setMemoDraft(event.target.value.slice(0, 10))}
              className="h-[58px] w-full rounded-lg border border-[#075BFF] bg-white px-4 pr-12 text-[17px] font-medium text-[#050B2D] outline-none ring-1 ring-[#075BFF] placeholder:text-[#A5ABBE]"
            />
            {memoDraft ? (
              <AppButton
                type="button"
                variant="unstyled"
                aria-label={t('transfer.memoEdit.clearAria')}
                onClick={() => setMemoDraft('')}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#A5ABBE]"
              >
                <X className="h-5 w-5 fill-current" />
              </AppButton>
            ) : null}
          </div>
          <p className="mt-2 text-right text-[13px] font-semibold text-[#858B94]">
            {memoDraft.length}/10
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-[#F7F7F8] px-5 py-5 text-[13px] font-semibold leading-7 text-[#7B828C]">
          <p className="mb-2 text-[14px] font-bold text-[#30343B]">
            {t('transfer.memoEdit.infoTitle')}
          </p>
          <p>· {isRecipientMemo ? t('transfer.memoEdit.recipientNote') : t('transfer.memoEdit.senderNote')}</p>
          <p>· {t('transfer.memoEdit.maxLengthNote')}</p>
          <p>
            ·{' '}
            {isRecipientMemo
              ? t('transfer.memoEdit.recipientTransferNote')
              : t('transfer.memoEdit.senderTransferNote')}
          </p>
        </div>
      </section>
    </MobileLayout>
  )
}
