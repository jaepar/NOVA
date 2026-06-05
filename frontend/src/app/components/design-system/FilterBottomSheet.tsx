import type { ReactNode } from 'react'
import { BottomSheet } from '../layout/BottomSheet'
import { AppButton } from './AppButton'
import { Btn_1Col } from './Btn_1Col'

interface FilterOption {
  value: string
  label: string
}

interface FilterSection {
  title: string
  options: FilterOption[]
  selectedValue: string
  onSelect: (value: string) => void
  columns?: 2 | 3
  customContent?: ReactNode
}

interface FilterBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  sections: FilterSection[]
  onApply: () => void
  applyButtonText?: string
  height?: string
  children?: ReactNode
}

export function FilterBottomSheet({
  isOpen,
  onClose,
  title = '필터',
  sections,
  onApply,
  applyButtonText = '적용하기',
  height = '520px',
  children,
}: FilterBottomSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      height={height}
      bottomAction={<Btn_1Col onClick={onApply}>{applyButtonText}</Btn_1Col>}
      bottomActionClassName="px-0"
    >
      <div className="space-y-6 pb-4">
        {sections.map((section, index) => (
          <div key={index} className="space-y-3">
            <h4 className="text-[14px] font-semibold leading-5 text-foreground">{section.title}</h4>
            <div
              className={
                section.columns === 3
                  ? 'grid grid-cols-3 gap-3'
                  : section.columns === 2
                    ? 'grid grid-cols-2 gap-3'
                    : 'flex flex-wrap gap-2'
              }
            >
              {section.options.map((option) => (
                <AppButton
                  variant="unstyled"
                  key={option.value}
                  onClick={() => section.onSelect(option.value)}
                  className={`${section.columns ? 'h-10 rounded-lg' : 'px-4 py-2 rounded-xl'} text-[14px] font-semibold transition-all ${
                    section.selectedValue === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {option.label}
                </AppButton>
              ))}
            </div>
            {section.customContent}
          </div>
        ))}
        {children}
      </div>
    </BottomSheet>
  )
}
