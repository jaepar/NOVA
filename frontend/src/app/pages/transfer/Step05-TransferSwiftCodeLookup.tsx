import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppButton } from '../../components/design-system/AppButton'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { transferCountries } from '../../data/transferCountries'
import {
  transferSwiftLookupItems,
  type TransferSwiftLookupItem,
} from '../../data/transferSwiftLookup'
import {
  useTransferBasicInfoPageStore,
  useTransferRecipientInfoPageStore,
} from '../../stores/pageStores'

function LookupInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <label className="block text-base text-foreground">{label}</label>
      <div className="relative mt-[6px] overflow-hidden rounded-2xl border border-border bg-background">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-16 w-full bg-transparent px-5 pr-16 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {value ? (
          <div className="absolute inset-y-0 right-4 flex items-center">
            <AppButton
              type="button"
              variant="unstyled"
              onClick={() => onChange('')}
              className="rounded-full bg-muted p-1 text-muted-foreground"
              aria-label="입력값 지우기"
            >
              <X className="h-4 w-4" />
            </AppButton>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function Step05TransferSwiftCodeLookup() {
  const navigate = useNavigate()
  const countryId = useTransferBasicInfoPageStore((state) => state.countryId)
  const setSwiftCode = useTransferRecipientInfoPageStore((state) => state.setSwiftCode)
  const setRoutingNumber = useTransferRecipientInfoPageStore((state) => state.setRoutingNumber)
  const setBankBranchName = useTransferRecipientInfoPageStore((state) => state.setBankBranchName)
  const [bankNameQuery, setBankNameQuery] = useState('')
  const [cityQuery, setCityQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const selectedCountry = useMemo(
    () => transferCountries.find((country) => country.id === countryId) ?? transferCountries[0],
    [countryId]
  )
  const scopedItems = useMemo(
    () => transferSwiftLookupItems.filter((item) => item.countryId === selectedCountry.id),
    [selectedCountry.id]
  )
  const filteredItems = useMemo(() => {
    const bankQuery = bankNameQuery.trim().toLowerCase()
    const citySearch = cityQuery.trim().toLowerCase()

    return scopedItems.filter((item) => {
      const bankMatched =
        bankQuery.length === 0 || item.bankName.toLowerCase().includes(bankQuery)
      const cityMatched = citySearch.length === 0 || item.city.toLowerCase().includes(citySearch)
      return bankMatched && cityMatched
    })
  }, [bankNameQuery, cityQuery, scopedItems])
  const resultItems = hasSearched ? filteredItems : scopedItems

  const handleSearch = () => {
    setHasSearched(true)
  }

  const handleSelectBank = (item: TransferSwiftLookupItem) => {
    setSwiftCode(item.swiftCode)
    setRoutingNumber(item.routingNumber)
    setBankBranchName(
      item.branchName ? `${item.bankName} / ${item.branchName}` : item.bankName
    )
    navigate('/transfer/send/step-05')
  }

  return (
    <MobileLayout
      title="SWIFT CODE 조회"
      headerType="close"
      closePath="/transfer/send/step-05"
      bottomContent={<Btn_1Col onClick={handleSearch}>조회</Btn_1Col>}
    >
      <div className="space-y-8 pb-4 pt-3">
        <section className="space-y-4">
          <div className="space-y-2">
            <label className="block text-base text-muted-foreground">국가명</label>
            <div className="flex items-center gap-4 rounded-2xl bg-background px-5 py-5">
              <span className="text-4xl">{selectedCountry.flag}</span>
              <span className="text-[18px] font-medium text-foreground">
                {selectedCountry.name}({selectedCountry.englishName})
              </span>
            </div>
          </div>

          <LookupInput
            label="은행명"
            value={bankNameQuery}
            onChange={setBankNameQuery}
          />

          <LookupInput label="도시명" value={cityQuery} onChange={setCityQuery} />
        </section>

        <section className="space-y-4">
          <div className="border-t border-border pt-5">
            <p className="text-base text-muted-foreground">
              조회된 은행 : {resultItems.length}건
            </p>
          </div>

          <div className="space-y-3">
            {resultItems.map((item) => (
              <AppButton
                key={item.id}
                type="button"
                variant="unstyled"
                onClick={() => handleSelectBank(item)}
                className="w-full rounded-2xl border border-border bg-background px-5 py-5 text-left transition-colors hover:bg-secondary"
              >
                <div className="space-y-5">
                  <p className="text-[18px] font-semibold text-foreground">{item.swiftCode}</p>
                  <div className="grid grid-cols-[88px_1fr] gap-y-4 text-base">
                    <span className="text-muted-foreground">은행명</span>
                    <span className="text-right text-primary">{item.bankName}</span>
                    <span className="text-muted-foreground">도시명</span>
                    <span className="text-right text-foreground">{item.city}</span>
                  </div>
                </div>
              </AppButton>
            ))}
          </div>
        </section>
      </div>
    </MobileLayout>
  )
}
