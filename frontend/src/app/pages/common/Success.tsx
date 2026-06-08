import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { CenteredTaskContent } from '../../components/design-system/CenteredTaskContent'
import successIllustrationSrc from './assets/success-illustration.png'

interface SuccessProps {
  headerTitle: string
  task: string
  description?: string
  visualImageSrc?: string
  visualImageAlt?: string
  buttonText?: string
  onButtonClick?: () => void
  redirectPath?: string
}

export function Success({
  headerTitle,
  task,
  description,
  visualImageSrc,
  visualImageAlt = '성공 이미지',
  buttonText = '확인',
  onButtonClick,
  redirectPath = '/main',
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
      bottomContent={
        <Btn_1Col variant="primary" onClick={handleConfirm}>
          {buttonText}
        </Btn_1Col>
      }
    >
      <CenteredTaskContent task={task} description={description} contentGapClassName="gap-3">
        {visualImageSrc ? (
          <img src={visualImageSrc} alt={visualImageAlt} className="h-56 w-56 object-contain" />
        ) : successIllustrationSrc ? (
          <img
            src={successIllustrationSrc}
            alt={visualImageAlt}
            className="h-56 w-56 object-contain"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary">
            <Check className="h-14 w-14 stroke-[4] text-white" />
          </div>
        )}
      </CenteredTaskContent>
    </MobileLayout>
  )
}
