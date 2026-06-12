import { useParams } from "react-router-dom";
import { ConsentCategoryCarouselView } from "../../components/consent/ConsentCategoryCarouselView";
import { transferConsentDefinition } from "../../domains/transfer-consent/definition.transfer";

export function TransferAllTermsAgreements() {
  const { categoryId } = useParams();

  return (
    <ConsentCategoryCarouselView
      definition={transferConsentDefinition}
      categoryId={categoryId}
      basePath="/global-transfer/send/step-01"
      preserveStateKey="preserveConsentState"
      resetCarouselCursorKey="resetCategoryCursor"
    />
  );
}
