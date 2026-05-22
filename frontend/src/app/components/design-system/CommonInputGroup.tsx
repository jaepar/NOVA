import { spacing } from './tokens'
import { Search } from 'lucide-react'

interface CommonInputGroupProps {
  label: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  type?: 'text' | 'email' | 'password' | 'tel' | 'number'
  showSearchIcon?: boolean
}

export function CommonInputGroup({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  showSearchIcon = false,
}: CommonInputGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="block">{label}</label>
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
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full ${showSearchIcon ? 'pl-12' : 'pl-4'} pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all mx-[0px] mt-[6px] mb-[0px]`}
          style={{ fontSize: '16px' }}
        />
      </div>
    </div>
  )
}
