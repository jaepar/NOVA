import { useParams } from 'react-router-dom'
import { ConsentCategoryCarouselView } from '../../components/consent/ConsentCategoryCarouselView'
import { livenessConsentDefinition } from '../../domains/verification-consent/definition.liveness-consent'

export function LivenessConsentAllTermsAgreements() {
  const { categoryId } = useParams()
  return (
    <ConsentCategoryCarouselView
      definition={livenessConsentDefinition}
      categoryId={categoryId}
      basePath="/account/step-07"
      preserveStateKey="preserveStep08State"
      resetCarouselCursorKey="resetCategoryCursor"
    />
  )
}






