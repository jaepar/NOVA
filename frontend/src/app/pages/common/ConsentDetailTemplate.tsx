import { useParams } from 'react-router-dom'
import { ConsentTermDetailView } from '../../components/consent/ConsentTermDetailView'
import { certificateConsentDefinitionSample } from '../../domains/definition.sample'

export function ConsentDetailTemplate() {
  const { termId } = useParams()
  return <ConsentTermDetailView definition={certificateConsentDefinitionSample} termId={termId} />
}


