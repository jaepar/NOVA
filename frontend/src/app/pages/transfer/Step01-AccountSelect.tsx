import { useMemo, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppButton, Btn_1Col, novaToast } from '../../components/design-system'
import { BottomSheet } from '../../components/layout/BottomSheet'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { translateError } from '../../i18n'
import { bankingApi, getBankingApiError } from '../../../api'
import { detectAccountNumber } from '../../data/accountNumberDetector'
import {
  BANK_OPTIONS,
  BANK_CODE_BY_ID,
  REQUIRED_ACCOUNT_LENGTH,
  normalizeAccountNumber,
  type BankOption,
} from './types'
import { useTransferStore } from './transferStore'
import { AccountContinueHint } from './components/AccountContinueHint'
import { BankMark } from './components/BankMark'

export function TransferAccountSelect() {
  const navigate = useNavigate()
  const accountNumber = useTransferStore((state) => state.accountNumber)
  const selectedBank = useTransferStore((state) => state.selectedBank)
  const setAccountNumber = useTransferStore((state) => state.setAccountNumber)
  const setSelectedBank = useTransferStore((state) => state.setSelectedBank)
  const setPreview = useTransferStore((state) => state.setPreview)
  const [isBankSheetOpen, setIsBankSheetOpen] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  const detectedBanks = useMemo(() => detectAccountNumber(accountNumber), [accountNumber])
  const suggestedBanks = useMemo(() => {
    const detectedBankIds = new Set(detectedBanks.map((bank) => bank.bankId))
    return BANK_OPTIONS.filter((bank) => detectedBankIds.has(bank.id))
  }, [detectedBanks])

  const isNextEnabled = accountNumber.length >= REQUIRED_ACCOUNT_LENGTH && selectedBank !== null
  const shouldShowContinueHint =
    accountNumber.length > 0 && suggestedBanks.length === 0 && selectedBank === null

  const handleAccountChange = (value: string) => {
    const nextValue = normalizeAccountNumber(value)
    const detectedBankIds = new Set(detectAccountNumber(nextValue).map((bank) => bank.bankId))

    setAccountNumber(nextValue)

    if (selectedBank && detectedBankIds.size > 0 && !detectedBankIds.has(selectedBank.id)) {
      setSelectedBank(null)
    }
  }

  const handleSelectBank = (bank: BankOption) => {
    setSelectedBank(bank)
    setIsBankSheetOpen(false)
  }

  const handleNext = async () => {
    if (!selectedBank || !isNextEnabled || isPreviewLoading) return

    setIsPreviewLoading(true)
    try {
      const preview = await bankingApi.previewTransfer({
        recipientBankCode: BANK_CODE_BY_ID[selectedBank.id] ?? selectedBank.id.toUpperCase(),
        recipientAccountNumber: accountNumber,
      })

      setPreview(preview)
      navigate('/transfer/amount')
    } catch (error) {
      const apiError = getBankingApiError(error)
      const fallback =
        apiError?.code === 'BANK-006'
          ? '수취인 계좌 정보를 찾을 수 없습니다.'
          : '이체 정보를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.'

      novaToast.error(translateError(apiError?.code, apiError?.message || fallback))
    } finally {
      setIsPreviewLoading(false)
    }
  }

  return (
    <>
      <MobileLayout
        title="이체"
        titleKey="transfer.title"
        headerType="back"
        onBack={() => navigate('/main')}
        headerTextColor="#020A2F"
        bottomContent={
          <Btn_1Col disabled={!isNextEnabled || isPreviewLoading} onClick={handleNext}>
            {isPreviewLoading ? '확인 중' : '다음'}
          </Btn_1Col>
        }
      >
        <section className="pt-5 text-[#020A2F]">
          <h2 className="text-[25px] font-bold leading-tight tracking-normal">
            어떤 계좌로 보낼까요?
          </h2>

          <div className="mt-7">
            <label htmlFor="transfer-account-number" className="text-sm font-medium">
              계좌번호 입력
            </label>
            <div className="relative mt-3">
              <input
                id="transfer-account-number"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={accountNumber}
                onChange={(event) => handleAccountChange(event.target.value)}
                placeholder="'-' 없이 숫자만 입력"
                className="h-[58px] w-full rounded-lg border border-[#CBD2E1] bg-white px-4 pr-12 text-[17px] font-medium outline-none transition-colors placeholder:text-[#A5ABBE] focus:border-[#075BFF] focus:ring-1 focus:ring-[#075BFF]"
              />
              {accountNumber ? (
                <AppButton
                  type="button"
                  variant="unstyled"
                  aria-label="계좌번호 지우기"
                  onClick={() => {
                    setAccountNumber('')
                    setSelectedBank(null)
                  }}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#A5ABBE]"
                >
                  <X className="h-5 w-5 fill-current" />
                </AppButton>
              ) : null}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium">은행 선택</p>
            <AppButton
              type="button"
              variant="unstyled"
              onClick={() => setIsBankSheetOpen(true)}
              className="mt-3 flex h-[58px] w-full items-center justify-between rounded-lg border border-[#CBD2E1] bg-white px-4 text-left text-[16px] transition-colors hover:bg-[#F7F9FC]"
            >
              {selectedBank ? (
                <span className="flex items-center gap-3 text-[#020A2F]">
                  <BankMark bank={selectedBank} size="sm" />
                  {selectedBank.name}
                </span>
              ) : (
                <span className="text-[#687089]">은행을 선택해주세요</span>
              )}
              <ChevronDown className="h-5 w-5 text-[#020A2F]" />
            </AppButton>
          </div>

          {suggestedBanks.length > 0 ? (
            <div className="mt-6 flex flex-wrap items-start gap-x-2 gap-y-3">
              {suggestedBanks.map((bank) => (
                <AppButton
                  key={bank.id}
                  type="button"
                  variant="unstyled"
                  onClick={() => handleSelectBank(bank)}
                  className={`inline-flex h-9 w-auto min-w-[92px] items-center justify-center gap-1 rounded-full border px-3 text-[12px] font-medium leading-none transition-colors ${
                    selectedBank?.id === bank.id
                      ? 'border-[#075BFF] bg-blue-50 text-[#075BFF]'
                      : 'border-[#E2E7F0] bg-white text-[#020A2F] hover:bg-[#F7F9FC]'
                  }`}
                >
                  <BankMark bank={bank} size="xs" />
                  <span className="whitespace-nowrap">{bank.name}</span>
                </AppButton>
              ))}
            </div>
          ) : shouldShowContinueHint ? (
            <AccountContinueHint />
          ) : null}
        </section>
      </MobileLayout>

      <BottomSheet
        isOpen={isBankSheetOpen}
        onClose={() => setIsBankSheetOpen(false)}
        title="은행을 선택해주세요"
        height="440px"
      >
        <div className="grid grid-cols-3 gap-2">
          {BANK_OPTIONS.map((bank) => (
            <AppButton
              key={bank.id}
              type="button"
              variant="unstyled"
              onClick={() => handleSelectBank(bank)}
              className={`flex h-[78px] flex-col items-center justify-center gap-1.5 rounded-lg border text-[12px] font-medium transition-colors ${
                selectedBank?.id === bank.id
                  ? 'border-[#075BFF] bg-blue-50 text-[#075BFF]'
                  : 'border-[#E2E7F0] bg-white text-[#020A2F] hover:bg-[#F7F9FC]'
              }`}
            >
              <BankMark bank={bank} size="lg" />
              <span className="whitespace-nowrap leading-none">{bank.name}</span>
            </AppButton>
          ))}
        </div>
      </BottomSheet>
    </>
  )
}
