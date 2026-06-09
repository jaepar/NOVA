import { AppButton } from './AppButton'

interface Btn1ColProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
}

export function Btn_1Col({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
}: Btn1ColProps) {
  const variants = {
    primary:
      'bg-primary text-primary-foreground hover:bg-blue-700 border-2 border-primary disabled:bg-secondary disabled:text-muted-foreground disabled:border-border disabled:hover:bg-secondary',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-accent border-2 border-secondary disabled:bg-secondary disabled:text-muted-foreground disabled:border-border disabled:hover:bg-secondary',
    outline:
      'bg-background border-2 border-primary text-primary hover:bg-blue-50 disabled:bg-secondary disabled:text-muted-foreground disabled:border-border disabled:hover:bg-secondary',
  }

  return (
    <AppButton
      onClick={onClick}
      disabled={disabled}
      variant="unstyled"
      className={`w-full py-4 px-6 rounded-xl transition-all disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {children}
    </AppButton>
  )
}
