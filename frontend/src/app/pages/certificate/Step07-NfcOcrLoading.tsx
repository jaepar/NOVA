import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Spinner } from '../../components/design-system/Spinner'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'

export function NfcOcrLoading() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/certificate/step-08', { replace: true })
    }, 3000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <MobileLayout
      title="비대면 실명확인"
      backPath="/certificate/step-06"
      bottomContent={
        <Btn_1Col onClick={() => navigate('/certificate/step-09')}>임시: 다음 페이지 이동</Btn_1Col>
      }
    >
      <div className="flex h-full flex-col items-center justify-center px-6 pb-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-semibold leading-tight">
            NFC와 OCR 정보를
            <br />
            대조하고 있어요
          </h2>
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">잠시만 기다려 주세요</p>
        </div>
      </div>
    </MobileLayout>
  )
}
