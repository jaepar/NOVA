import { AppButton } from './AppButton'
import { useTranslation } from '../../i18n'

interface Btn2ColProps {
  leftLabel: string
  leftLabelKey?: string
  rightLabel: string
  rightLabelKey?: string
  onLeftClick?: () => void
  onRightClick?: () => void
  leftVariant?: 'primary' | 'secondary' | 'outline'
  rightVariant?: 'primary' | 'secondary' | 'outline'
}

export function Btn_2Col({
  leftLabel,
  leftLabelKey,
  rightLabel,
  rightLabelKey,
  onLeftClick,
  onRightClick,
  leftVariant = 'outline',
  rightVariant = 'primary',
}: Btn2ColProps) {
  const { t } = useTranslation()
  const resolvedLeftLabel = leftLabelKey ? t(leftLabelKey, leftLabel) : leftLabel
  const resolvedRightLabel = rightLabelKey ? t(rightLabelKey, rightLabel) : rightLabel
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-dark border-2 border-primary',
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
        {resolvedLeftLabel}
      </AppButton>
      <AppButton
        onClick={onRightClick}
        variant="unstyled"
        className={`flex-1 py-4 px-6 rounded-xl transition-all ${variants[rightVariant]}`}
      >
        {resolvedRightLabel}
      </AppButton>
    </div>
  )
}
