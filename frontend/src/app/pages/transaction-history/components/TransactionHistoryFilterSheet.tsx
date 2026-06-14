import { useTranslation } from '../../../i18n'
import { FilterBottomSheet } from '../../../components/design-system/FilterBottomSheet'
import { CommonInputGroup } from '../../../components/design-system/CommonInputGroup'

const searchMaxLength = 14

interface DateInputProps {
  value: string
  onChange: (value: string) => void
}

function DateInput({ value, onChange }: DateInputProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-[46px] w-full rounded-lg border border-border bg-background px-3 text-[14px] font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
    />
  )
}

interface TransactionHistoryFilterSheetProps {
  isOpen: boolean
  selectedPeriod: string
  selectedType: string
  selectedSort: string
  searchKeyword: string
  customDateFrom: string
  customDateTo: string
  onClose: () => void
  onApply: () => void
  onSelectPeriod: (value: string) => void
  onSelectType: (value: string) => void
  onSelectSort: (value: string) => void
  onSearchKeywordChange: (value: string) => void
  onCustomDateFromChange: (value: string) => void
  onCustomDateToChange: (value: string) => void
}

export function TransactionHistoryFilterSheet({
  isOpen,
  selectedPeriod,
  selectedType,
  selectedSort,
  searchKeyword,
  customDateFrom,
  customDateTo,
  onClose,
  onApply,
  onSelectPeriod,
  onSelectType,
  onSelectSort,
  onSearchKeywordChange,
  onCustomDateFromChange,
  onCustomDateToChange,
}: TransactionHistoryFilterSheetProps) {
  const { t } = useTranslation()

  const sections = [
    {
      title: t('transactionHistory.periodLabel'),
      options: [
        { value: 'ONE_WEEK', label: t('transactionHistory.periodWeek') },
        { value: 'ONE_MONTH', label: t('transactionHistory.periodMonth') },
        { value: 'CUSTOM', label: t('transactionHistory.periodCustom') },
      ],
      selectedValue: selectedPeriod,
      onSelect: onSelectPeriod,
      columns: 3 as const,
      customContent:
        selectedPeriod === 'CUSTOM' ? (
          <div className="grid grid-cols-2 gap-3">
            <DateInput value={customDateFrom} onChange={onCustomDateFromChange} />
            <DateInput value={customDateTo} onChange={onCustomDateToChange} />
          </div>
        ) : undefined,
    },
    {
      title: t('transactionHistory.typeLabel'),
      options: [
        { value: 'ALL', label: t('transactionHistory.typeAll') },
        { value: 'DEPOSIT', label: t('transactionHistory.typeDeposit') },
        { value: 'WITHDRAWAL', label: t('transactionHistory.typeWithdrawal') },
      ],
      selectedValue: selectedType,
      onSelect: onSelectType,
      columns: 3 as const,
    },
    {
      title: t('transactionHistory.sortLabel'),
      options: [
        { value: 'DESC', label: t('transactionHistory.sortLatest') },
        { value: 'ASC', label: t('transactionHistory.sortOldest') },
      ],
      selectedValue: selectedSort,
      onSelect: onSelectSort,
      columns: 2 as const,
    },
  ]

  return (
    <FilterBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('transactionHistory.filterTitle')}
      sections={sections}
      onApply={onApply}
      applyButtonText={t('transactionHistory.filterApply')}
      height="640px"
    >
      <section className="space-y-3">
        <h4 className="text-[14px] font-semibold leading-5 text-foreground">{t('transactionHistory.searchLabel')}</h4>
        <CommonInputGroup
          placeholder={t('transactionHistory.searchPlaceholder')}
          value={searchKeyword}
          onChange={onSearchKeywordChange}
          showSearchIcon
          maxLength={searchMaxLength}
          showCounter
        />
        <p className="text-[12px] font-medium leading-4 text-muted-foreground">
          {t('transactionHistory.searchMaxLengthHint').replace('{max}', String(searchMaxLength))}
        </p>
      </section>
    </FilterBottomSheet>
  )
}
