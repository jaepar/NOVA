import { useParams } from 'react-router-dom'
import { ConsentTermDetailView } from '../../components/consent/ConsentTermDetailView'
import { livenessConsentDefinition } from '../../domains/verification-consent/definition.liveness-consent'

export function LivenessConsentTermDetail() {
  const { termId } = useParams()
  return (
    <ConsentTermDetailView
      definition={livenessConsentDefinition}
      termId={termId}
      basePath="/account/step-07"
      preserveStateKey="preserveStep08State"
    />
  )
}






