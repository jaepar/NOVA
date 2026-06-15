import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { HeaderActionButton } from './HeaderActionButton'

interface CloseFixedHeaderProps {
  title: string
  onClose?: () => void
  closePath?: string
  backgroundColor?: string
  textColor?: string
}

export function CloseFixedHeader({
  title,
  onClose,
  closePath = '/',
  backgroundColor = '#ffffff',
  textColor = '#000000',
}: CloseFixedHeaderProps) {
  const navigate = useNavigate()

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      navigate(closePath, { replace: true })
    }
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full"
      style={{
        paddingTop: 'var(--app-header-top-padding)',
        backgroundColor,
        color: textColor,
      }}
    >
      <div
        className="flex items-center justify-between px-5"
        style={{ height: 'var(--app-header-height)' }}
      >
        <div className="w-10" />

        <h1 className="flex-1 text-center text-[20px] font-semibold leading-none" style={{ color: textColor }}>
          {title}
        </h1>

        <div className="w-10 flex justify-end">
          <HeaderActionButton onClick={handleClose} align="right">
            <X className="w-6 h-6" />
          </HeaderActionButton>
        </div>
      </div>
    </header>
  )
}
