import { useParams } from 'react-router-dom'
import { ConsentTermDetailView } from '../../components/consent/ConsentTermDetailView'
import { certificateConsentDefinition } from '../../domains/certificate-consent/definition.certificate'
import { useTranslation } from '../../i18n'

export function CertificateIssuanceConsentTermDetail() {
  const { termId } = useParams()
  const { language } = useTranslation()

  return (
    <ConsentTermDetailView
      key={language}
      definition={certificateConsentDefinition}
      termId={termId}
      basePath="/certificate/step-01"
      preserveStateKey="preserveConsentState"
      translationNamespace="consent.certificateIssuance"
    />
  )
}
