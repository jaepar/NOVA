import { AppButton } from './AppButton'

interface Btn2ColProps {
  leftLabel: string
  rightLabel: string
  onLeftClick?: () => void
  onRightClick?: () => void
  leftVariant?: 'primary' | 'secondary' | 'outline'
  rightVariant?: 'primary' | 'secondary' | 'outline'
}

export function Btn_2Col({
  leftLabel,
  rightLabel,
  onLeftClick,
  onRightClick,
  leftVariant = 'outline',
  rightVariant = 'primary',
}: Btn2ColProps) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-blue-700 border-2 border-primary',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-accent border-2 border-secondary',
    outline: 'bg-background border-2 border-border text-foreground hover:bg-secondary',
  }

  return (
    <div className="flex gap-4 w-full">
      <AppButton
        onClick={onLeftClick}
        variant="unstyled"
        className={`flex-1 py-4 px-6 rounded-xl transition-all ${variants[leftVariant]}`}
      >
        {leftLabel}
      </AppButton>
      <AppButton
        onClick={onRightClick}
        variant="unstyled"
        className={`flex-1 py-4 px-6 rounded-xl transition-all ${variants[rightVariant]}`}
      >
        {rightLabel}
      </AppButton>
    </div>
  )
}
