import { useParams } from 'react-router-dom'
import { ConsentCategoryCarouselView } from '../../components/consent/ConsentCategoryCarouselView'
import { certificateConsentDefinition } from '../../domains/certificate-consent/definition.certificate'
import { useTranslation } from '../../i18n'

export function CertificateIssuanceConsentAllTermsAgreements() {
  const { categoryId } = useParams()
  const { language } = useTranslation()

  return (
    <ConsentCategoryCarouselView
      key={language}
      definition={certificateConsentDefinition}
      categoryId={categoryId}
      basePath="/certificate/step-01"
      preserveStateKey="preserveConsentState"
      resetCarouselCursorKey="resetCategoryCursor"
      translationNamespace="consent.certificateIssuance"
    />
  )
}
