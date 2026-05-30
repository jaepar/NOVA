import { useParams } from 'react-router-dom'
import { ConsentCategoryCarouselView } from '../../components/consent/ConsentCategoryCarouselView'
import { certificateConsentDefinitionSample } from '../../domains/definition.sample'

export function ConsentCategoryCarouselTemplate() {
  const { categoryId } = useParams()
  return (
    <ConsentCategoryCarouselView
      definition={certificateConsentDefinitionSample}
      categoryId={categoryId}
    />
  )
}


