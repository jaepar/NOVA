import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { useTranslation } from '../../i18n'

interface CloseButtonTemplateProps {
  headerTitle: string
  headerTitleKey?: string
  onClose?: () => void
  closePath?: string
  children: ReactNode
  buttonText?: string
  buttonTextKey?: string
  onButtonClick?: () => void
  redirectPath?: string
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  showBottomButton?: boolean
}

export function CloseButtonTemplate({
  headerTitle,
  headerTitleKey,
  onClose,
  closePath = '/',
  children,
  buttonText,
  buttonTextKey,
  onButtonClick,
  redirectPath,
  buttonVariant = 'primary',
  showBottomButton = false,
}: CloseButtonTemplateProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const resolvedButtonText = buttonTextKey ? t(buttonTextKey, buttonText) : buttonText

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      navigate(closePath)
    }
  }

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick()
    } else if (redirectPath) {
      navigate(redirectPath)
    }
  }

  return (
    <MobileLayout
      title={headerTitle}
      titleKey={headerTitleKey}
      headerType="close"
      onClose={handleClose}
      closePath={closePath}
      bottomContent={
        showBottomButton && buttonText ? (
          <Btn_1Col onClick={handleButtonClick} variant={buttonVariant}>
            {resolvedButtonText}
          </Btn_1Col>
        ) : undefined
      }
    >
      {children}
    </MobileLayout>
  )
}
