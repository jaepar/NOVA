import { useNavigate } from 'react-router-dom'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { CenteredTaskContent } from '../../components/design-system/CenteredTaskContent'
import failedIllustrationSrc from './assets/failed-illustration.png'

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
      <CenteredTaskContent task={task} description={description} contentGapClassName="gap-3">
        {visualImageSrc ? (
          <img src={visualImageSrc} alt={visualImageAlt} className="h-56 w-56 object-contain" />
        ) : (
          <img
            src={failedIllustrationSrc}
            alt={visualImageAlt}
            className="h-56 w-56 object-contain"
          />
        )}
      </CenteredTaskContent>
    </MobileLayout>
  )
}
