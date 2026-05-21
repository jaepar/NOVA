import { useParams } from "react-router-dom";
import { ConsentTermDetailView } from "../../components/consent/ConsentTermDetailView";
import { certificateConsentDefinitionSample } from "../../domains/certificate-consent/definition.sample";

export function CertificateIssuanceConsentTermDetail() {
  const { termId } = useParams();
  return (
    <ConsentTermDetailView
      definition={certificateConsentDefinitionSample}
      termId={termId}
      basePath="/certificate/step-01"
      preserveStateKey="preserveConsentState"
    />
  );
}
