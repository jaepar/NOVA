import { useParams } from 'react-router-dom'
import { ConsentCategoryCarouselView } from '../../components/consent/ConsentCategoryCarouselView'
import { certificateConsentDefinition } from '../../domains/certificate-consent/definition.certificate'

export function CertificateIssuanceConsentAllTermsAgreements() {
  const { categoryId } = useParams()
  return (
    <ConsentCategoryCarouselView
      definition={certificateConsentDefinition}
      categoryId={categoryId}
      basePath="/certificate/step-01"
      preserveStateKey="preserveConsentState"
      resetCarouselCursorKey="resetCategoryCursor"
    />
  )
}

