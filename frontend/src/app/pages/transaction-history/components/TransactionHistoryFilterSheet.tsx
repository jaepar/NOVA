import { FilterBottomSheet } from '../../../components/design-system/FilterBottomSheet'
import { CommonInputGroup } from '../../../components/design-system/CommonInputGroup'

const periodOptions = ['1주일', '1개월', '직접입력']
const typeOptions = ['전체', '입금', '출금']
const sortOptions = ['최신순', '과거순']
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
  const sections = [
    {
      title: '조회 기간',
      options: periodOptions.map((o) => ({ value: o, label: o })),
      selectedValue: selectedPeriod,
      onSelect: onSelectPeriod,
      columns: 3 as const,
      customContent:
        selectedPeriod === '직접입력' ? (
          <div className="grid grid-cols-2 gap-3">
            <DateInput value={customDateFrom} onChange={onCustomDateFromChange} />
            <DateInput value={customDateTo} onChange={onCustomDateToChange} />
          </div>
        ) : undefined,
    },
    {
      title: '거래 구분',
      options: typeOptions.map((o) => ({ value: o, label: o })),
      selectedValue: selectedType,
      onSelect: onSelectType,
      columns: 3 as const,
    },
    {
      title: '정렬 순서',
      options: sortOptions.map((o) => ({ value: o, label: o })),
      selectedValue: selectedSort,
      onSelect: onSelectSort,
      columns: 2 as const,
    },
  ]

  return (
    <FilterBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="조회조건 선택"
      sections={sections}
      onApply={onApply}
      applyButtonText="조회"
      height="640px"
    >
      <section className="space-y-3">
        <h4 className="text-[14px] font-semibold leading-5 text-foreground">검색</h4>
        <CommonInputGroup
          placeholder="메모, 거래대상 검색"
          value={searchKeyword}
          onChange={onSearchKeywordChange}
          showSearchIcon
          maxLength={searchMaxLength}
          showCounter
        />
        <p className="text-[12px] font-medium leading-4 text-muted-foreground">
          ⓘ 한글/영문/숫자 최대 {searchMaxLength}자까지 입력가능합니다.
        </p>
      </section>
    </FilterBottomSheet>
  )
}
