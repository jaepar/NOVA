import { type BankOption, BANK_LOGO_SRC } from '../types'

export function BankMark({
  bank,
  size = 'md',
}: {
  bank: BankOption
  size?: 'xs' | 'sm' | 'md' | 'lg'
}) {
  const sizeClassName = {
    xs: 'h-4 w-4',
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-9 w-9',
  }[size]

  return (
    <img
      src={BANK_LOGO_SRC[bank.id]}
      alt=""
      aria-hidden="true"
      decoding="async"
      draggable={false}
      className={`shrink-0 object-contain ${sizeClassName}`}
    />
  )
}
