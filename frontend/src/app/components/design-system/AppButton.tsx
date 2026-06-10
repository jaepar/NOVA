import type { ButtonHTMLAttributes, ReactNode } from 'react'

type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'unstyled'

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: AppButtonVariant
}

export function AppButton({
  children,
  variant = 'unstyled',
  className = '',
  ...props
}: AppButtonProps) {
  const variants: Record<AppButtonVariant, string> = {
    primary:
      'bg-primary text-primary-foreground hover:bg-blue-700 border-2 border-primary disabled:bg-secondary disabled:text-muted-foreground disabled:border-border disabled:hover:bg-secondary',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-accent border-2 border-secondary disabled:bg-secondary disabled:text-muted-foreground disabled:border-border disabled:hover:bg-secondary',
    outline:
      'bg-background border-2 border-border text-foreground hover:bg-secondary disabled:bg-secondary disabled:text-muted-foreground disabled:border-border disabled:hover:bg-secondary',
    ghost:
      'bg-transparent text-foreground hover:bg-secondary disabled:text-muted-foreground disabled:hover:bg-transparent',
    unstyled: '',
  }

  return (
    <button
      {...props}
      className={`${variants[variant]} outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-0 ${className}`.trim()}
    >
      {children}
    </button>
  )
}
