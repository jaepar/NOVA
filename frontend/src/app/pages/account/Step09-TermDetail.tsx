import { useParams } from 'react-router-dom'
import { ConsentTermDetailView } from '../../components/consent/ConsentTermDetailView'
import { accountOpenConsentDefinition } from '../../domains/account-consent/definition.open-account'

export function AccountConsentTermDetail() {
  const { termId } = useParams()

  return (
    <ConsentTermDetailView
      definition={accountOpenConsentDefinition}
      termId={termId}
      basePath="/account/step-09"
      preserveStateKey="preserveStep09State"
    />
  )
}
