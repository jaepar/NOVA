import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bankingApi, getBankingApiError } from '../../../api'
import { AppButton, Btn_1Col, novaToast } from '../../components/design-system'
import { BottomSheet } from '../../components/layout/BottomSheet'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { translateError, useTranslation } from '../../i18n'
import { Loading } from '../common/Loading'
import { formatCurrency, getShortTransferBankName, SOURCE_BANK } from './types'
import { useTransferStore } from './transferStore'
import { BankMark } from './components/BankMark'
import { NumericKeypad } from './components/NumericKeypad'

export function TransferReview() {
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const accountNumber = useTransferStore((state) => state.accountNumber)
  const selectedBank = useTransferStore((state) => state.selectedBank)
  const preview = useTransferStore((state) => state.preview)
  const amount = useTransferStore((state) => state.amount)
  const recipientMemoName = useTransferStore((state) => state.recipientMemoName)
  const senderMemoName = useTransferStore((state) => state.senderMemoName)
  const recipientName = preview?.recipient.recipientName ?? ''
  const amountText = formatCurrency(amount, language)
  const [isPasswordSheetOpen, setIsPasswordSheetOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [isTransferLoading, setIsTransferLoading] = useState(false)

  const createIdempotencyKey = () => {
    const randomPart =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)

    return `transfer-${Date.now()}-${randomPart}`
  }

  const submitTransfer = async (accountPassword: string) => {
    if (isTransferLoading) return
    if (!preview) {
      novaToast.error(t('transfer.review.unknownError'))
      setPassword('')
      return
    }

    setIsTransferLoading(true)
    try {
      await bankingApi.transfer(
        {
          withdrawAccountId: preview.myAccount.accountNumber,
          depositAccountId: recipientAccount,
          transferAmount: Number(amount),
          accountPassword,
        },
        createIdempotencyKey()
      )

      setIsPasswordSheetOpen(false)
      navigate('/transfer/complete')
    } catch (error) {
      const apiError = getBankingApiError(error)
      const isPasswordError = apiError?.code === 'ACCOUNT-007' || apiError?.code === 'BANK-007'

      setPassword('')
      if (isPasswordError) {
        novaToast.error(translateError(apiError?.code, t('transfer.review.passwordError')))
        return
      }

      setIsPasswordSheetOpen(false)
      navigate('/transfer/failed', {
        state: {
          message: translateError(
            apiError?.code,
            apiError?.message || t('transfer.review.requestFailed')
          ),
        },
      })
    } finally {
      setIsTransferLoading(false)
    }
  }

  const handlePasswordPress = (value: string) => {
    setPassword((current) => {
      if (current.length >= 4 || isTransferLoading) return current

      const next = `${current}${value}`.slice(0, 4)
      if (next.length === 4) {
        void submitTransfer(next)
      }
      return next
    })
  }

  return (
    <>
      <MobileLayout
        title={t('transfer.title')}
        titleKey="transfer.title"
        headerType="back"
        onBack={() => navigate('/transfer/amount-confirm')}
        bottomContent={
          <Btn_1Col
            onClick={() => {
              setPassword('')
              setIsPasswordSheetOpen(true)
            }}
            disabled={isTransferLoading}
          >
            {isTransferLoading ? t('transfer.review.transferring') : t('transfer.review.transfer')}
          </Btn_1Col>
        }
      >
        <section className="pt-12 text-[#202633]">
          <div className="flex items-center gap-7">
            <BankMark bank={SOURCE_BANK} size="lg" />
            {selectedBank ? <BankMark bank={selectedBank} size="lg" /> : null}
          </div>

          {language === 'en' ? (
            <h2 className="mt-9 text-[24px] font-bold leading-snug">
              <span className="break-words text-[#006BFF]">{recipientName}</span>{' '}
              {t('transfer.review.recipientSuffix')}
              <span className="mt-1 block text-[#006BFF]">{amountText}</span>
              <span className="block">{t('transfer.review.confirmSuffix')}</span>
            </h2>
          ) : (
            <h2 className="mt-9 text-[24px] font-bold leading-snug">
              <span className="break-words text-[#006BFF]">{recipientName}</span>
              {t('transfer.review.recipientSuffix')}
              <br />
              <span className="text-[#006BFF]">{amountText}</span>
              {t('transfer.review.confirmSuffix')}
            </h2>
          )}
          <p className="mt-4 text-[14px] font-semibold text-[#8A9099]">
            {t('transfer.review.toAccount')
              .replace('{bankName}', selectedBank ? getShortTransferBankName(selectedBank, language) : '')
              .replace('{accountNumber}', accountNumber)}
          </p>

          <div className="mt-8 rounded-2xl bg-[#F7F7F8] px-5 py-5 text-[15px]">
            <div className="flex justify-between py-2">
              <span className="text-[#7B828C]">{t('transfer.review.recipientMemo')}</span>
              <span className="font-bold">{recipientMemoName || preview?.myAccount.userName || ''}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#7B828C]">{t('transfer.review.senderMemo')}</span>
              <span className="font-bold">{senderMemoName || recipientName}</span>
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
            onClick={() => {
              if (!isTransferLoading) setIsPasswordSheetOpen(false)
            }}
            className="absolute right-0 top-0 text-[34px] leading-none"
          >
            x
          </AppButton>
          <h2 className="pt-8 text-[20px] font-bold">{t('transfer.review.passwordTitle')}</h2>
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
              onClear={() => {
                if (!isTransferLoading) setPassword('')
              }}
              onBackspace={() => {
                if (!isTransferLoading) setPassword((current) => current.slice(0, -1))
              }}
            />
          </div>
        </div>
      </BottomSheet>

      {isTransferLoading ? (
        <div className="fixed inset-0 z-[100] bg-white">
          <Loading
            headerTitle={t('transfer.title')}
            headerTitleKey="transfer.title"
            task={t('transfer.loadingTask')}
            taskKey="transfer.loadingTask"
            description={t('transfer.loadingDescription')}
            descriptionKey="transfer.loadingDescription"
            spinnerSize="lg"
          />
        </div>
      ) : null}
    </>
  )
}
