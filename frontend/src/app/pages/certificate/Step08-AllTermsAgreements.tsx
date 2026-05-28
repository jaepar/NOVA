import { useParams } from 'react-router-dom'
import { ConsentCategoryCarouselView } from '../../components/consent/ConsentCategoryCarouselView'
import { livenessConsentDefinitionSample } from '../../domains/certificate-consent/definition.liveness.sample'

export function LivenessConsentAllTermsAgreements() {
  const { categoryId } = useParams()
  return (
    <ConsentCategoryCarouselView
      definition={livenessConsentDefinitionSample}
      categoryId={categoryId}
      basePath="/certificate/step-08"
      preserveStateKey="preserveStep08State"
      resetCarouselCursorKey="resetCategoryCursor"
    />
  )
}
