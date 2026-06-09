import { AppButton } from './AppButton'

interface SegmentedOption<T extends string> {
  label: string
  value: T
}

interface SegmentedOptionFieldProps<T extends string> {
  options: [SegmentedOption<T>, SegmentedOption<T>]
  value: T
  onChange: (value: T) => void
}

export function SegmentedOptionField<T extends string>({
  options,
  value,
  onChange,
}: SegmentedOptionFieldProps<T>) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-background">
      {options.map((option, index) => {
        const isSelected = option.value === value

        return (
          <AppButton
            key={option.value}
            type="button"
            variant="unstyled"
            onClick={() => onChange(option.value)}
            className={`px-4 py-5 text-lg transition-colors ${
              index === 1 ? 'border-l border-border' : ''
            } ${
              isSelected ? 'bg-primary/10 font-semibold text-primary' : 'text-foreground'
            }`}
          >
            {option.label}
          </AppButton>
        )
      })}
    </div>
  )
}
