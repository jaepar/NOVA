import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../i18n'
import { useForeignerCardRegistrationStore } from '../../stores/pageStores'
import { Success } from '../common/Success'

export function ForeignerCardCompleted() {
  const navigate = useNavigate()
  const reset = useForeignerCardRegistrationStore((state) => state.reset)
  const { t } = useTranslation()

  const handleConfirm = () => {
    reset()
    navigate('/main')
  }

  return (
    <Success
      headerTitle={t('foreignerCard.title')}
      task={t('foreignerCard.completedTask')}
      buttonText={t('common.confirm')}
      onButtonClick={handleConfirm}
      headerType="none"
    />
  )
}
