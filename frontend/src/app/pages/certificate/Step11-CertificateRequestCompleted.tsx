import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../i18n'
import { Success } from '../common/Success'

export function CertificateRequestCompleted() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleConfirm = () => {
    navigate('/main')
  }

  return (
    <Success
      headerTitle={t('certificate.title')}
      task={t('certificate.step11Task')}
      description={t('certificate.step11Description')}
      buttonText={t('common.confirm')}
      onButtonClick={handleConfirm}
      headerType="none"
    />
  )
}
