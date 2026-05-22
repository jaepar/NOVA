import { AppButton } from '../../../components/design-system/AppButton'

interface WalletAmountChipProps {
  amount: number
  onClick: (amount: number) => void
}

export function WalletAmountChip({ amount, onClick }: WalletAmountChipProps) {
  return (
    <AppButton
      type="button"
      variant="unstyled"
      onClick={() => onClick(amount)}
      className="flex h-[44px] flex-1 items-center justify-center rounded-lg border border-[#d8d8d8] bg-white text-[15px] font-semibold text-[#111111] transition-colors hover:bg-[#f6f6f6] active:border-black active:bg-black active:text-white"
    >
      + {amount / 10000}만원
    </AppButton>
  )
}
