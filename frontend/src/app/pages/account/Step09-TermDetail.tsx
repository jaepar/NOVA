import { useParams } from 'react-router-dom'
import { ConsentTermDetailView } from '../../components/consent/ConsentTermDetailView'
import { accountOpenConsentDefinition } from '../../domains/account-consent/definition.open-account'
import { useTranslation } from '../../i18n'

export function AccountConsentTermDetail() {
  const { termId } = useParams()
  const { language } = useTranslation()

  return (
    <ConsentTermDetailView
      key={language}
      definition={accountOpenConsentDefinition}
      termId={termId}
      basePath="/account/step-09"
      preserveStateKey="preserveStep09State"
    />
  )
}
