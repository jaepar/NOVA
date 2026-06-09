import { useLocation } from 'react-router-dom'
import { Failed } from '../common/Failed'

type TransferFailedLocationState = {
  message?: string
}

export function TransferFailed() {
  const location = useLocation()
  const state = location.state as TransferFailedLocationState | null

  return (
    <Failed
      headerTitle="이체"
      task="계좌이체에 실패했어요"
      description={state?.message || '이체 정보를 확인한 뒤 다시 시도해 주세요.'}
      buttonText="확인"
      redirectPath="/main"
      backPath="/transfer/review"
    />
  )
}
