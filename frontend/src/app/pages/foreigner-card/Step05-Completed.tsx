import { useNavigate } from 'react-router-dom'
import { Success } from '../common/Success'
import { useForeignerCardRegistrationStore } from '../../stores/pageStores'

export function ForeignerCardCompleted() {
  const navigate = useNavigate()
  const reset = useForeignerCardRegistrationStore((state) => state.reset)

  const handleConfirm = () => {
    reset()
    navigate('/main')
  }

  return (
    <Success
      headerTitle="외국인등록증 등록"
      task="외국인등록증 등록을 완료했어요"
      buttonText="확인"
      onButtonClick={handleConfirm}
      headerType="none"
    />
  )
}
