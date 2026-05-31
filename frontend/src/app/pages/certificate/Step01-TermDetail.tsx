import { useParams } from 'react-router-dom'
import { ConsentTermDetailView } from '../../components/consent/ConsentTermDetailView'
import { certificateConsentDefinition } from '../../domains/certificate-consent/definition.certificate'

export function CertificateIssuanceConsentTermDetail() {
  const { termId } = useParams()
  return (
    <ConsentTermDetailView
      definition={certificateConsentDefinition}
      termId={termId}
      basePath="/certificate/step-01"
      preserveStateKey="preserveConsentState"
    />
  )
}

