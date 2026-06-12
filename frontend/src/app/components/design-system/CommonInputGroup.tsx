import { spacing } from './tokens'
import { Search } from 'lucide-react'

interface CommonInputGroupProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  type?: 'text' | 'email' | 'password' | 'tel' | 'number'
  showSearchIcon?: boolean
  maxLength?: number
  showCounter?: boolean
}

export function CommonInputGroup({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  showSearchIcon = false,
  maxLength,
  showCounter = false,
}: CommonInputGroupProps) {
  const showRightOverlay = showCounter && maxLength !== undefined

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="block">{label}</label>}
      <div className="relative">
        {showSearchIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full ${showSearchIcon ? 'pl-12' : 'pl-4'} ${showRightOverlay ? 'pr-[72px]' : 'pr-4'} py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all mx-[0px] mt-[6px] mb-[0px]`}
          style={{ fontSize: '16px' }}
        />
        {showRightOverlay && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-semibold leading-none text-muted-foreground pointer-events-none">
            {value?.length ?? 0} / {maxLength}자
          </span>
        )}
      </div>
    </div>
  )
}
