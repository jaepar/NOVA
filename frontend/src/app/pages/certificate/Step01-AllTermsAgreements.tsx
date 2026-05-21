import { useParams } from "react-router-dom";
import { ConsentCategoryCarouselView } from "../../components/consent/ConsentCategoryCarouselView";
import { certificateConsentDefinitionSample } from "../../domains/certificate-consent/definition.sample";

export function CertificateIssuanceConsentAllTermsAgreements() {
  const { categoryId } = useParams();
  return (
    <ConsentCategoryCarouselView
      definition={certificateConsentDefinitionSample}
      categoryId={categoryId}
      basePath="/certificate/step-01"
      preserveStateKey="preserveConsentState"
      resetCarouselCursorKey="resetCategoryCursor"
    />
  );
}
