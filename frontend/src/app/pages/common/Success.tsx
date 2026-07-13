import { type ReactNode, useEffect, useState } from 'react'
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
  topContent?: ReactNode
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
  topContent,
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
      bottomBackgroundColor="transparent"
      bottomContent={
        <Btn_1Col variant="primary" onClick={handleConfirm} disabled={buttonDisabled}>
          {resolvedButtonText}
        </Btn_1Col>
      }
    >
      <div className="flex h-full flex-col">
        {topContent}
        <div className="min-h-0 flex-1">
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
              <SuccessBurstVisual label={resolvedVisualImageAlt} />
            )}
          </CenteredTaskContent>
        </div>
      </div>
    </MobileLayout>
  )
}

function SuccessBurstVisual({ label }: { label: string }) {
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
      <SuccessVisualStyles />

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`flex h-[104px] w-[104px] items-center justify-center rounded-full bg-[#EAF3FF] ${
            isComplete ? 'animate-[nova-success-ring-pop_520ms_cubic-bezier(0.2,0.9,0.2,1)_both]' : 'animate-[nova-success-ring-wait_900ms_ease-in-out_infinite]'
          }`}
          style={{ backgroundColor: 'var(--success-visual-outer, #EAF3FF)' }}
        >
          <div
            className="flex h-[78px] w-[78px] items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--success-visual-inner, #DCEBFF)' }}
          >
            <Check
              className={`h-14 w-14 stroke-[4.5] ${
                isComplete
                  ? 'nova-success-check animate-[nova-success-check-pop_520ms_cubic-bezier(0.2,0.9,0.2,1)_both]'
                  : 'scale-50 opacity-0'
              }`}
              style={{ color: 'var(--success-visual-check, #1D6FE8)' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function SuccessVisualStyles() {
  return (
    <style>
      {`
        @keyframes nova-success-ring-wait {
          0%, 100% { transform: scale(0.96); }
          50% { transform: scale(1); }
        }

        @keyframes nova-success-ring-pop {
          0% { transform: scale(0.94); }
          58% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }

        @keyframes nova-success-check-pop {
          0% { transform: scale(0.36); opacity: 0; }
          58% { transform: scale(1.18); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .nova-success-check {
            animation-duration: 1ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 1ms !important;
          }
        }
      `}
    </style>
  )
}
