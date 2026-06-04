import { useMemo, useState } from 'react'
import { Search, ChevronDown, Check, CircleHelp, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppButton } from '../../components/design-system/AppButton'
import { SegmentedOptionField } from '../../components/design-system/SegmentedOptionField'
import { BottomSheet } from '../../components/layout/BottomSheet'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { CountrySelectBottomSheet } from '../../components/transfer/CountrySelectBottomSheet'
import { transferCountries } from '../../data/transferCountries'
import { transferCurrencies } from '../../data/transferCurrencies'
import {
  useTransferBasicInfoPageStore,
  useTransferRecipientInfoPageStore,
  useTransferSenderInfoPageStore,
} from '../../stores/pageStores'

const transferPurposeOptions = [
  '거주자(외국인 제외)의 무증빙 해외송금',
  '해외유학생 송금',
  '해외체재자 송금',
  '외국인/비거주자 국내소득 송금',
  '비거주자 재외동포 국내재산반출 송금',
  '해외이주비 송금',
  '대외계정 송금',
  '비거주자 자유원계정 송금',
] as const

const feeBurdenOptions = [
  { label: '보내는 분 부담', value: 'sender' as const },
  { label: '받는 분 부담', value: 'receiver' as const },
] as const

type SelectionSheet = 'purpose' | 'country' | 'currency' | null

function formatTransferAmount(value: string) {
  const digits = value.replace(/\D/g, '')

  if (!digits) return ''

  return Number(digits).toLocaleString('ko-KR')
}

export function Step02TransferBasicInfo() {
  const navigate = useNavigate()
  const purpose = useTransferBasicInfoPageStore((state) => state.purpose)
  const countryId = useTransferBasicInfoPageStore((state) => state.countryId)
  const currencyCode = useTransferBasicInfoPageStore((state) => state.currencyCode)
  const amount = useTransferBasicInfoPageStore((state) => state.amount)
  const feeBurden = useTransferBasicInfoPageStore((state) => state.feeBurden)
  const setPurpose = useTransferBasicInfoPageStore((state) => state.setPurpose)
  const setCountryId = useTransferBasicInfoPageStore((state) => state.setCountryId)
  const setCurrencyCode = useTransferBasicInfoPageStore((state) => state.setCurrencyCode)
  const setAmount = useTransferBasicInfoPageStore((state) => state.setAmount)
  const setFeeBurden = useTransferBasicInfoPageStore((state) => state.setFeeBurden)
  const resetTransferSenderInfo = useTransferSenderInfoPageStore((state) => state.reset)
  const resetTransferRecipientInfo = useTransferRecipientInfoPageStore((state) => state.reset)
  const setSwiftCode = useTransferRecipientInfoPageStore((state) => state.setSwiftCode)
  const setAccountNumber = useTransferRecipientInfoPageStore((state) => state.setAccountNumber)
  const setRoutingNumber = useTransferRecipientInfoPageStore((state) => state.setRoutingNumber)
  const setBankBranchName = useTransferRecipientInfoPageStore(
    (state) => state.setBankBranchName
  )
  const [openSheet, setOpenSheet] = useState<SelectionSheet>(null)

  const selectedCountry = useMemo(
    () => transferCountries.find((item) => item.id === countryId) ?? transferCountries[0],
    [countryId]
  )
  const selectedCurrency = useMemo(
    () => transferCurrencies.find((item) => item.code === currencyCode) ?? transferCurrencies[0],
    [currencyCode]
  )
  const canProceed =
    purpose.length > 0 &&
    countryId.length > 0 &&
    currencyCode.length > 0 &&
    amount.replace(/\D/g, '').length > 0

  const handleCurrencySelect = (nextCurrencyCode: string) => {
    setCurrencyCode(nextCurrencyCode)
    setOpenSheet(null)
  }

  return (
    <>
      <MobileLayout
        title="해외송금"
        backPath="/global-transfer/send/step-01"
        bottomContent={
          <div className="flex w-full gap-4">
            <AppButton
              variant="outline"
              onClick={() => navigate('/global-transfer/send/step-01')}
              className="flex-1 rounded-xl px-6 py-4"
            >
              이전
            </AppButton>
            <AppButton
              variant="primary"
              disabled={!canProceed}
              onClick={() => {
                resetTransferSenderInfo()
                resetTransferRecipientInfo()
                navigate('/global-transfer/send/step-03')
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
            <h1 className="text-[24px] font-semibold leading-tight text-[#132347]">
              송금 기본정보 입력
            </h1>
          </section>

          <section className="space-y-6">
            <div className="space-y-2">
              <label className="block text-base text-foreground">송금목적</label>
              <AppButton
                type="button"
                variant="unstyled"
                onClick={() => setOpenSheet('purpose')}
                className="mt-[6px] flex w-full items-center justify-between rounded-2xl border border-border bg-background px-5 py-5 text-left text-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <span className="min-w-0 truncate">{purpose}</span>
                <ChevronDown className="h-6 w-6 shrink-0 text-muted-foreground" />
              </AppButton>
            </div>

            <div className="space-y-2">
              <label className="block text-base text-foreground">송금국가</label>
              <AppButton
                type="button"
                variant="unstyled"
                onClick={() => setOpenSheet('country')}
                className="mt-[6px] flex w-full items-center justify-between rounded-2xl border border-border bg-background px-5 py-5 text-left text-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <span className="min-w-0 truncate">
                  {selectedCountry.name}({selectedCountry.englishName})
                </span>
                <Search className="h-6 w-6 shrink-0 text-muted-foreground" />
              </AppButton>
            </div>

            <div className="space-y-2">
              <label className="block text-base text-foreground">통화</label>
              <AppButton
                type="button"
                variant="unstyled"
                onClick={() => setOpenSheet('currency')}
                className="mt-[6px] flex w-full items-center justify-between rounded-2xl border border-border bg-background px-5 py-5 text-left text-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <span className="flex min-w-0 items-center gap-3 truncate">
                  <span className="text-2xl">{selectedCurrency.flag}</span>
                  <span className="truncate">{selectedCurrency.name}</span>
                </span>
                <ChevronDown className="h-6 w-6 shrink-0 text-muted-foreground" />
              </AppButton>
            </div>

            <div className="space-y-2">
              <label className="block text-base text-foreground">송금액</label>
              <div className="relative mt-[6px] overflow-hidden rounded-2xl border border-border bg-background">
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(event) => setAmount(formatTransferAmount(event.target.value))}
                  placeholder="숫자입력"
                  className="h-16 w-full bg-transparent px-5 pr-28 text-right text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center gap-3 text-lg text-muted-foreground">
                  <span>·</span>
                  <span>00</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="block text-base text-foreground">중개수수료</label>
                <CircleHelp className="h-5 w-5 text-muted-foreground" />
              </div>
              <SegmentedOptionField
                options={feeBurdenOptions}
                value={feeBurden}
                onChange={setFeeBurden}
              />
            </div>
          </section>
        </div>
      </MobileLayout>

      <BottomSheet
        isOpen={openSheet === 'purpose'}
        onClose={() => setOpenSheet(null)}
        title=""
        height="520px"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-2">
            <p className="text-lg font-semibold text-foreground">송금목적 선택</p>
            <AppButton
              type="button"
              variant="unstyled"
              onClick={() => setOpenSheet(null)}
              className="p-1 text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </AppButton>
          </div>
          <div className="divide-y divide-border rounded-2xl border border-border bg-background">
            {transferPurposeOptions.map((option) => {
              const isSelected = purpose === option

              return (
                <AppButton
                  key={option}
                  type="button"
                  variant="unstyled"
                  onClick={() => {
                    setPurpose(option)
                    setOpenSheet(null)
                  }}
                  className="flex w-full items-center justify-between px-4 py-4 text-left text-foreground transition-colors hover:bg-secondary"
                >
                  <span className="pr-3">{option}</span>
                  {isSelected ? <Check className="h-5 w-5 shrink-0 text-primary" /> : null}
                </AppButton>
              )
            })}
          </div>
        </div>
      </BottomSheet>

      <CountrySelectBottomSheet
        countries={transferCountries}
        selectedCountryId={selectedCountry.id}
        isOpen={openSheet === 'country'}
        onClose={() => setOpenSheet(null)}
        onSelect={(country) => {
          const isCountryChanged = country.id !== selectedCountry.id
          setCountryId(country.id)
          setCurrencyCode(country.currencyCode)
          if (isCountryChanged) {
            setSwiftCode('')
            setAccountNumber('')
            setRoutingNumber('')
            setBankBranchName('')
          }
          setOpenSheet(null)
        }}
        title="송금국가 선택"
      />

      <BottomSheet
        isOpen={openSheet === 'currency'}
        onClose={() => setOpenSheet(null)}
        title=""
        height="560px"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-2">
            <p className="text-lg font-semibold text-foreground">통화 선택</p>
            <AppButton
              type="button"
              variant="unstyled"
              onClick={() => setOpenSheet(null)}
              className="p-1 text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </AppButton>
          </div>
          <div className="divide-y divide-border rounded-2xl border border-border bg-background">
            {transferCurrencies.map((currency) => {
              const isSelected = selectedCurrency.code === currency.code

              return (
                <AppButton
                  key={currency.code}
                  type="button"
                  variant="unstyled"
                  onClick={() => handleCurrencySelect(currency.code)}
                  className="flex w-full items-center justify-between px-4 py-4 text-left text-foreground transition-colors hover:bg-secondary"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="text-2xl">{currency.flag}</span>
                    <span className="truncate">
                      {currency.name} ({currency.code})
                    </span>
                  </span>
                  {isSelected ? <Check className="h-5 w-5 shrink-0 text-primary" /> : null}
                </AppButton>
              )
            })}
          </div>
        </div>
      </BottomSheet>
    </>
  )
}
