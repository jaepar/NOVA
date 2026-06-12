import { useParams } from 'react-router-dom'
import { ConsentCategoryCarouselView } from '../../components/consent/ConsentCategoryCarouselView'
import { livenessConsentDefinition } from '../../domains/verification-consent/definition.liveness-consent'
import { useTranslation } from '../../i18n'

export function LivenessConsentAllTermsAgreements() {
  const { categoryId } = useParams()
  const { language } = useTranslation()

  return (
    <ConsentCategoryCarouselView
      key={language}
      definition={livenessConsentDefinition}
      categoryId={categoryId}
      basePath="/certificate/step-08"
      preserveStateKey="preserveStep08State"
      resetCarouselCursorKey="resetCategoryCursor"
      translationNamespace="consent.certificate"
    />
  )
}
