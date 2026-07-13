import { useNavigate } from 'react-router-dom'
import { Success } from '../common/Success'
import { useTranslation } from '../../i18n'
import { DemoVerificationProgress } from './DemoVerificationProgress'

export function DemoCertificateRequestComplete() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <Success
      headerTitle={t('certificate.title')}
      task={t('certificate.step11Task')}
      description={t('certificate.step11Description')}
      buttonText={t('common.confirm')}
      onButtonClick={() => navigate('/')}
      headerType="none"
      topContent={<DemoVerificationProgress currentStep={5} />}
    />
  )
}
