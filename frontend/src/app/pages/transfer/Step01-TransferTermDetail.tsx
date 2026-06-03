import { useParams } from "react-router-dom";
import { ConsentTermDetailView } from "../../components/consent/ConsentTermDetailView";
import { transferConsentDefinition } from "../../domains/transfer-consent/definition.transfer";

export function TransferTermDetail() {
  const { termId } = useParams();

  return (
    <ConsentTermDetailView
      definition={transferConsentDefinition}
      termId={termId}
      basePath="/transfer/send/step-01"
      preserveStateKey="preserveConsentState"
    />
  );
}
