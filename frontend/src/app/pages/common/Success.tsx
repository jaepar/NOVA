import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { CenteredTaskContent } from '../../components/design-system/CenteredTaskContent'
import { useTranslation } from '../../i18n'

interface SuccessProps {
  headerTitle: string
  headerTitleKey?: string
  task: string
  taskKey?: string
  description?: string
  descriptionKey?: string
  visualImageSrc?: string
  visualImageAlt?: string
  visualImageAltKey?: string
  buttonText?: string
  buttonTextKey?: string
  buttonDisabled?: boolean
  onButtonClick?: () => void
  redirectPath?: string
  headerType?: 'back' | 'none'
}

export function Success({
  headerTitle,
  task,
  description,
  visualImageSrc,
  visualImageAlt,
  buttonText,
  buttonDisabled = false,
  onButtonClick,
  redirectPath = '/main',
  headerType = 'back',
  headerTitleKey,
  taskKey,
  descriptionKey,
  visualImageAltKey,
  buttonTextKey,
}: SuccessProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const resolvedButtonText = buttonTextKey
    ? t(buttonTextKey, buttonText)
    : buttonText ?? t('common.confirm')
  const resolvedVisualImageAlt = visualImageAltKey
    ? t(visualImageAltKey, visualImageAlt)
    : visualImageAlt ?? t('status.successImageAlt')

  const handleConfirm = () => {
    if (onButtonClick) {
      onButtonClick()
      return
    }
    navigate(redirectPath)
  }

  return (
    <MobileLayout
      title={headerTitle}
      titleKey={headerTitleKey}
      headerType={headerType}
      bottomContent={
        <Btn_1Col variant="primary" onClick={handleConfirm} disabled={buttonDisabled}>
          {resolvedButtonText}
        </Btn_1Col>
      }
    >
      <CenteredTaskContent
        task={task}
        taskKey={taskKey}
        description={description}
        descriptionKey={descriptionKey}
      >
        {visualImageSrc ? (
          <img
            src={visualImageSrc}
            alt={resolvedVisualImageAlt}
            className="h-24 w-24 object-contain"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600">
            <Check className="h-14 w-14 stroke-[4] text-white" />
          </div>
        )}
      </CenteredTaskContent>
    </MobileLayout>
  )
}
