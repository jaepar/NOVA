import { useParams } from 'react-router-dom'
import { ConsentCategoryCarouselView } from '../../components/consent/ConsentCategoryCarouselView'
import { accountOpenConsentDefinition } from '../../domains/account-consent/definition.open-account'
import { useTranslation } from '../../i18n'

export function AccountConsentAllTermsAgreements() {
  const { categoryId } = useParams()
  const { language } = useTranslation()

  return (
    <ConsentCategoryCarouselView
      key={language}
      definition={accountOpenConsentDefinition}
      categoryId={categoryId}
      basePath="/account/step-09"
      preserveStateKey="preserveStep09State"
      resetCarouselCursorKey="resetCategoryCursor"
    />
  )
}
