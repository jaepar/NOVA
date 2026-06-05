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
      bottomContent={
        <Btn_1Col variant="primary" onClick={handleConfirm}>
          {buttonText}
        </Btn_1Col>
      }
    >
      <CenteredTaskContent task={task} description={description}>
        {visualImageSrc ? (
          <img src={visualImageSrc} alt={visualImageAlt} className="h-24 w-24 object-contain" />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600">
            <Check className="h-14 w-14 stroke-[4] text-white" />
          </div>
        )}
      </CenteredTaskContent>
    </MobileLayout>
  )
}
