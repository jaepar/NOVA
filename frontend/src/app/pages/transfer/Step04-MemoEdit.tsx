import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppButton, Btn_1Col } from '../../components/design-system'
import { MobileLayout } from '../../components/layout/MobileLayout'
import {
  BANK_OPTIONS,
  RECIPIENT_NAME,
  SOURCE_ACCOUNT,
  SOURCE_BANK,
  type MemoType,
} from './types'
import { useTransferStore } from './transferStore'
import { BankMark } from './components/BankMark'

export function TransferMemoEdit({ type }: { type: MemoType }) {
  const navigate = useNavigate()
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
  const sourceAccountName = preview?.myAccount.accountName ?? '우리SUPER주거래통장'
  const sourceAccountNumber = preview?.myAccount.accountNumber ?? SOURCE_ACCOUNT
  const isRecipientMemo = type === 'recipient'
  const [memoDraft, setMemoDraft] = useState(isRecipientMemo ? recipientMemoName : senderMemoName)

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
      title="이체"
      headerType="back"
      onBack={() => navigate('/transfer/amount-confirm')}
      bottomContent={
        <Btn_1Col
          disabled={!memoDraft.trim()}
          onClick={handleComplete}
        >
          완료
        </Btn_1Col>
      }
    >
      <section className="pt-5 text-[#202633]">
        <div>
          <div className="flex items-center gap-2 text-[16px] font-bold">
            <BankMark bank={isRecipientMemo ? recipientBank : SOURCE_BANK} size="md" />
            <span>{isRecipientMemo ? `${recipientName} 님 계좌로` : '우리은행 계좌에서'}</span>
          </div>
          <p className="mt-2 text-[13px] font-semibold text-[#8A9099]">
            {isRecipientMemo
              ? `${recipientBank.name.replace('은행', '')} ${recipientAccount}`
              : `${sourceAccountName} ${sourceAccountNumber}`}
          </p>
        </div>

        <div className="mt-10">
          <label htmlFor="transfer-memo-name" className="text-[14px] font-semibold">
            통장표기 이름
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
                aria-label="통장표기 이름 지우기"
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
          <p className="mb-2 text-[14px] font-bold text-[#30343B]">안내</p>
          <p>· {isRecipientMemo ? '받는 분 통장에 표시될 이름입니다.' : '내 통장에 표시될 이름입니다.'}</p>
          <p>· 최대 10자까지 입력할 수 있습니다.</p>
          <p>
            ·{' '}
            {isRecipientMemo
              ? '이체 시 이 이름으로 표시됩니다.'
              : '이체 내역에서 이 이름으로 표시됩니다.'}
          </p>
        </div>
      </section>
    </MobileLayout>
  )
}
