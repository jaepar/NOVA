import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { HeaderActionButton } from './HeaderActionButton'

interface FixedHeaderProps {
  title: string
  onBack?: () => void
  backPath?: string
  backgroundColor?: string
  textColor?: string
  showBackButton?: boolean
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
}

export function FixedHeader({
  title,
  onBack,
  backPath,
  backgroundColor = '#ffffff',
  textColor = '#000000',
  showBackButton = true,
  leftContent,
  rightContent,
}: FixedHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backPath) {
      navigate(backPath, { replace: true })
    } else {
      navigate(-1)
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
        {showBackButton ? (
          <div className="w-10 flex justify-start">
            <HeaderActionButton onClick={handleBack} align="left">
              <ChevronLeft className="w-6 h-6" />
            </HeaderActionButton>
          </div>
        ) : leftContent ? (
          <div className="w-10 flex justify-start">{leftContent}</div>
        ) : (
          <div className="w-10" />
        )}

        <h1 className="flex-1 text-center text-[20px] font-semibold leading-none" style={{ color: textColor }}>
          {title}
        </h1>

        {rightContent ? (
          <div className="w-10 flex justify-end">{rightContent}</div>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </header>
  )
}
