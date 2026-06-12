import { useEffect, useState } from 'react'
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
      bottomBackgroundColor="transparent"
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
        contentGapClassName="gap-3"
      >
        {visualImageSrc ? (
          <img
            src={visualImageSrc}
            alt={resolvedVisualImageAlt}
            className="h-56 w-56 object-contain"
          />
        ) : (
          <FailedPopVisual label={resolvedVisualImageAlt} />
        )}
      </CenteredTaskContent>
    </MobileLayout>
  )
}

function FailedPopVisual({ label }: { label: string }) {
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setIsComplete(true)
    }, 560)

    return () => window.clearTimeout(timerId)
  }, [])

  return (
    <div
      role="img"
      aria-label={label}
      className="relative h-40 w-56"
      data-state={isComplete ? 'complete' : 'loading'}
    >
      <FailedVisualStyles />

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`flex h-[104px] w-[104px] items-center justify-center rounded-full bg-[#FEF2F2] ${
            isComplete ? 'animate-[nova-failed-ring-pop_520ms_cubic-bezier(0.2,0.9,0.2,1)_both]' : 'animate-[nova-failed-ring-wait_900ms_ease-in-out_infinite]'
          }`}
        >
          <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[#FEE2E2]">
            <X
              className={`h-14 w-14 stroke-[4.5] text-[#EF4444] ${
                isComplete
                  ? 'nova-failed-icon animate-[nova-failed-icon-pop_520ms_cubic-bezier(0.2,0.9,0.2,1)_both]'
                  : 'scale-50 opacity-0'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FailedVisualStyles() {
  return (
    <style>
      {`
        @keyframes nova-failed-ring-wait {
          0%, 100% { transform: scale(0.96); }
          50% { transform: scale(1); }
        }

        @keyframes nova-failed-ring-pop {
          0% { transform: scale(0.94); }
          58% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }

        @keyframes nova-failed-icon-pop {
          0% { transform: scale(0.36); opacity: 0; }
          58% { transform: scale(1.18); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .nova-failed-icon {
            animation-duration: 1ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 1ms !important;
          }
        }
      `}
    </style>
  )
}
