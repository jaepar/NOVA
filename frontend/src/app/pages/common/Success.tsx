import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { CenteredTaskContent } from '../../components/design-system/CenteredTaskContent'

interface SuccessProps {
  headerTitle: string
  task: string
  description?: string
  visualImageSrc?: string
  visualImageAlt?: string
  buttonText?: string
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
  visualImageAlt = '성공 이미지',
  buttonText = '확인',
  buttonDisabled = false,
  onButtonClick,
  redirectPath = '/main',
  headerType = 'back',
}: SuccessProps) {
  const navigate = useNavigate()

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
      headerType={headerType}
      bottomBackgroundColor="transparent"
      bottomContent={
        <Btn_1Col variant="primary" onClick={handleConfirm} disabled={buttonDisabled}>
          {buttonText}
        </Btn_1Col>
      }
    >
      <CenteredTaskContent task={task} description={description} contentGapClassName="gap-3">
        {visualImageSrc ? (
          <img src={visualImageSrc} alt={visualImageAlt} className="h-56 w-56 object-contain" />
        ) : (
          <SuccessBurstVisual label={visualImageAlt} />
        )}
      </CenteredTaskContent>
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
        >
          <div
            className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[#DCEBFF]"
          >
            <Check
              className={`h-14 w-14 stroke-[4.5] text-[#1D6FE8] ${
                isComplete
                  ? 'nova-success-check animate-[nova-success-check-pop_520ms_cubic-bezier(0.2,0.9,0.2,1)_both]'
                  : 'scale-50 opacity-0'
              }`}
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
