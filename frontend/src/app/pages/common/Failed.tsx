import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { CenteredTaskContent } from '../../components/design-system/CenteredTaskContent'

interface FailedProps {
  headerTitle: string
  task: string
  description?: string
  visualImageSrc?: string
  visualImageAlt?: string
  buttonText?: string
  onButtonClick?: () => void
  redirectPath?: string
  backPath?: string
}

export function Failed({
  headerTitle,
  task,
  description,
  visualImageSrc,
  visualImageAlt = '실패 이미지',
  buttonText = '다시 시도',
  onButtonClick,
  redirectPath = '/',
  backPath,
}: FailedProps) {
  const navigate = useNavigate()

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
      backPath={backPath}
      bottomContent={
        <Btn_1Col variant="primary" onClick={handleRetry}>
          {buttonText}
        </Btn_1Col>
      }
    >
      <CenteredTaskContent task={task} description={description}>
        {visualImageSrc ? (
          <img src={visualImageSrc} alt={visualImageAlt} className="h-20 w-20 object-contain" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <X className="h-10 w-10 stroke-[3] text-red-500" />
          </div>
        )}
      </CenteredTaskContent>
    </MobileLayout>
  )
}
