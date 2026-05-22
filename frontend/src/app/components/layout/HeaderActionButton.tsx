import { ReactNode } from 'react'
import { AppButton } from '../design-system/AppButton'

interface HeaderActionButtonProps {
  onClick: () => void
  children: ReactNode
  align?: 'left' | 'right'
}

export function HeaderActionButton({ onClick, children, align = 'left' }: HeaderActionButtonProps) {
  const edgeClass = align === 'left' ? '-ml-2' : '-mr-2'

  return (
    <AppButton
      variant="unstyled"
      onClick={onClick}
      className={`p-2 ${edgeClass} hover:bg-secondary rounded-lg transition-colors`}
    >
      {children}
    </AppButton>
  )
}
