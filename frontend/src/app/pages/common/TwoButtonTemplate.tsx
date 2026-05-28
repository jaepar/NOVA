import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_2Col } from '../../components/design-system/Btn_2Col'

interface TwoButtonTemplateProps {
  headerTitle: string
  headerType?: 'back' | 'close'
  showBackButton?: boolean
  onBack?: () => void
  backPath?: string
  onClose?: () => void
  closePath?: string
  headerRightContent?: ReactNode
  children: ReactNode
  leftButtonText: string
  rightButtonText: string
  onLeftButtonClick?: () => void
  onRightButtonClick?: () => void
  leftRedirectPath?: string
  rightRedirectPath?: string
  leftButtonVariant?: 'primary' | 'secondary' | 'outline'
  rightButtonVariant?: 'primary' | 'secondary' | 'outline'
}

export function TwoButtonTemplate({
  headerTitle,
  headerType = 'back',
  showBackButton = true,
  onBack,
  backPath,
  onClose,
  closePath,
  headerRightContent,
  children,
  leftButtonText,
  rightButtonText,
  onLeftButtonClick,
  onRightButtonClick,
  leftRedirectPath,
  rightRedirectPath,
  leftButtonVariant = 'outline',
  rightButtonVariant = 'primary',
}: TwoButtonTemplateProps) {
  const navigate = useNavigate()

  const handleLeftClick = () => {
    if (onLeftButtonClick) {
      onLeftButtonClick()
    } else if (leftRedirectPath) {
      navigate(leftRedirectPath)
    }
  }

  const handleRightClick = () => {
    if (onRightButtonClick) {
      onRightButtonClick()
    } else if (rightRedirectPath) {
      navigate(rightRedirectPath)
    }
  }

  return (
    <MobileLayout
      title={headerTitle}
      headerType={headerType}
      showBackButton={showBackButton}
      onBack={onBack}
      backPath={backPath}
      onClose={onClose}
      closePath={closePath}
      headerRightContent={headerRightContent}
      bottomContent={
        <Btn_2Col
          leftLabel={leftButtonText}
          rightLabel={rightButtonText}
          onLeftClick={handleLeftClick}
          onRightClick={handleRightClick}
          leftVariant={leftButtonVariant}
          rightVariant={rightButtonVariant}
        />
      }
    >
      {children}
    </MobileLayout>
  )
}
