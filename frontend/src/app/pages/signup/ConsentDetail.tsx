import { useParams } from "react-router-dom";
import { ConsentTermDetailView } from "../../components/consent/ConsentTermDetailView";
import { signupConsentDefinition } from "./consentDefinition";

export function ConsentDetail() {
  const { termId } = useParams();
  return <ConsentTermDetailView definition={signupConsentDefinition} termId={termId} basePath="/signup/terms" />;
}
