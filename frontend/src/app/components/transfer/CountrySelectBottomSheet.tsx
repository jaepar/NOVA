import { useMemo, useState } from 'react'
import { Search, X, Check } from 'lucide-react'
import { AppButton } from '../design-system/AppButton'
import { BottomSheet } from '../layout/BottomSheet'
import { formatTransferCountryName, type TransferCountry } from '../../data/transferCountries'
import { useTranslation } from '../../i18n'

interface CountrySelectBottomSheetProps {
  countries: TransferCountry[]
  selectedCountryId: string
  isOpen: boolean
  onClose: () => void
  onSelect: (country: TransferCountry) => void
  title?: string
  height?: string
}

export function CountrySelectBottomSheet({
  countries,
  selectedCountryId,
  isOpen,
  onClose,
  onSelect,
  title,
  height = '640px',
}: CountrySelectBottomSheetProps) {
  const { language, t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const sheetTitle = title ?? t('globalTransfer.swiftLookup.countrySelectTitle')

  const filteredCountries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) return countries

    return countries.filter((country) => {
      const korean = country.nameKo.toLowerCase()
      const english = country.nameEn.toLowerCase()
      return korean.includes(query) || english.includes(query)
    })
  }, [countries, searchQuery])

  const handleClose = () => {
    setSearchQuery('')
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="" height={height} disableScroll>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-center justify-between pb-4">
          <p className="text-lg font-semibold text-foreground">{sheetTitle}</p>
          <AppButton
            type="button"
            variant="unstyled"
            onClick={handleClose}
            className="p-1 text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </AppButton>
        </div>

        <div className="sticky top-0 z-10 bg-[rgb(253,253,253)] pb-4">
          <div className="relative">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('globalTransfer.swiftLookup.countrySearchPlaceholder')}
              className="w-full rounded-xl border border-border bg-input-background py-3 pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ fontSize: '16px' }}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="divide-y divide-border rounded-2xl border border-border bg-background">
            {filteredCountries.map((country) => {
              const isSelected = country.id === selectedCountryId

              return (
                <AppButton
                  key={country.id}
                  type="button"
                  variant="unstyled"
                  onClick={() => {
                    setSearchQuery('')
                    onSelect(country)
                  }}
                  className="flex w-full items-center justify-between px-4 py-4 text-left text-foreground transition-colors hover:bg-secondary"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="text-2xl">{country.flag}</span>
                    <span className="truncate">
                      {formatTransferCountryName(country, language)}
                    </span>
                  </span>
                  {isSelected ? <Check className="h-5 w-5 shrink-0 text-primary" /> : null}
                </AppButton>
              )
            })}
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}
