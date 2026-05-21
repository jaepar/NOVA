import { useParams } from "react-router-dom";
import { ConsentTermDetailView } from "../../components/consent/ConsentTermDetailView";
import { livenessConsentDefinitionSample } from "../../domains/certificate-consent/definition.liveness.sample";

export function LivenessConsentTermDetail() {
  const { termId } = useParams();
  return (
    <ConsentTermDetailView
      definition={livenessConsentDefinitionSample}
      termId={termId}
      basePath="/certificate/step-10"
      preserveStateKey="preserveStep10State"
    />
  );
}
