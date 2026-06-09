import { useParams } from 'react-router-dom'
import { ConsentCategoryCarouselView } from '../../components/consent/ConsentCategoryCarouselView'
import { accountOpenConsentDefinition } from '../../domains/account-consent/definition.open-account'

export function AccountConsentAllTermsAgreements() {
  const { categoryId } = useParams()

  return (
    <ConsentCategoryCarouselView
      definition={accountOpenConsentDefinition}
      categoryId={categoryId}
      basePath="/account/step-09"
      preserveStateKey="preserveStep09State"
      resetCarouselCursorKey="resetCategoryCursor"
    />
  )
}
