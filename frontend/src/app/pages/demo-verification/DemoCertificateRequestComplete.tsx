import { useNavigate } from 'react-router-dom'
import { Success } from '../common/Success'
import { useTranslation } from '../../i18n'
import { DemoVerificationProgress } from './DemoVerificationProgress'
import { useDemoVerificationStore } from './demoVerificationStore'

export function DemoCertificateRequestComplete() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const markCertificateUnderReview = useDemoVerificationStore(
    (state) => state.markCertificateUnderReview,
  )

  const handleConfirm = () => {
    markCertificateUnderReview()
    navigate('/demo/verification', { replace: true })
  }

  return (
    <Success
      headerTitle={t('certificate.title')}
      task={t('certificate.step11Task')}
      description={t('certificate.step11Description')}
      buttonText={t('common.confirm')}
      onButtonClick={handleConfirm}
      headerType="none"
      topContent={<DemoVerificationProgress currentStep={5} />}
    />
  )
}
