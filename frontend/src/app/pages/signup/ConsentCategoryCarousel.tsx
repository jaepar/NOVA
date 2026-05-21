import { useParams } from "react-router-dom";
import { ConsentCategoryCarouselView } from "../../components/consent/ConsentCategoryCarouselView";
import { signupConsentDefinition } from "./consentDefinition";

export function ConsentCategoryCarousel() {
  const { categoryId } = useParams();
  return (
    <ConsentCategoryCarouselView
      definition={signupConsentDefinition}
      categoryId={categoryId}
      basePath="/signup/terms"
    />
  );
}
