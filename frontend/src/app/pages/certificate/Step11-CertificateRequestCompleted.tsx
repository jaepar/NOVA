import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { certificateApi, getCertificateApiError } from '../../../api'
import { novaToast } from '../../components/design-system'
import { translateError, useTranslation } from '../../i18n'
import { Success } from '../common/Success'

export function CertificateRequestCompleted() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)
      await certificateApi.requestIssuance()
      navigate('/main')
    } catch (error) {
      const apiError = getCertificateApiError(error)
      novaToast.error(
        translateError(
          apiError?.code,
          apiError?.message || t('certificate.issuanceRequestFailed')
        )
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Success
      headerTitle={t('certificate.title')}
      task={t('certificate.step11Task')}
      description={t('certificate.step11Description')}
      buttonText={isSubmitting ? t('certificate.processing') : t('common.confirm')}
      buttonDisabled={isSubmitting}
      onButtonClick={handleConfirm}
      headerType="none"
    />
  )
}
