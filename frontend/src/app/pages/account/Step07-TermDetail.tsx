import { useParams } from 'react-router-dom'
import { ConsentTermDetailView } from '../../components/consent/ConsentTermDetailView'
import { livenessConsentDefinition } from '../../domains/verification-consent/definition.liveness-consent'
import { useTranslation } from '../../i18n'

export function LivenessConsentTermDetail() {
  const { termId } = useParams()
  const { language } = useTranslation()

  return (
    <ConsentTermDetailView
      key={language}
      definition={livenessConsentDefinition}
      termId={termId}
      basePath="/account/step-07"
      preserveStateKey="preserveStep08State"
    />
  )
}
