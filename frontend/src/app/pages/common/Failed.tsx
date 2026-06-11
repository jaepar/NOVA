import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { CenteredTaskContent } from '../../components/design-system/CenteredTaskContent'
import { useTranslation } from '../../i18n'

interface FailedProps {
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
  onButtonClick?: () => void
  redirectPath?: string
  backPath?: string
}

export function Failed({
  headerTitle,
  task,
  description,
  visualImageSrc,
  visualImageAlt,
  buttonText,
  onButtonClick,
  redirectPath = '/',
  backPath,
  headerTitleKey,
  taskKey,
  descriptionKey,
  visualImageAltKey,
  buttonTextKey,
}: FailedProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const resolvedButtonText = buttonTextKey
    ? t(buttonTextKey, buttonText)
    : buttonText ?? t('common.retry')
  const resolvedVisualImageAlt = visualImageAltKey
    ? t(visualImageAltKey, visualImageAlt)
    : visualImageAlt ?? t('status.failedImageAlt')

  const handleRetry = () => {
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
      backPath={backPath}
      bottomContent={
        <Btn_1Col variant="primary" onClick={handleRetry}>
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
            className="h-20 w-20 object-contain"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <X className="h-10 w-10 stroke-[3] text-red-500" />
          </div>
        )}
      </CenteredTaskContent>
    </MobileLayout>
  )
}
