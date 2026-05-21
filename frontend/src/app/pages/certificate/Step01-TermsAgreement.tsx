import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { ConsentOverviewAccordion } from "../../components/consent/ConsentOverviewAccordion";
import { certificateConsentDefinitionSample } from "../../domains/certificate-consent/definition.sample";

export function CertificateIssuanceConsentAgreement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRequiredComplete, setIsRequiredComplete] = useState(false);
  const preserveState = Boolean((location.state as { preserveConsentState?: boolean } | null)?.preserveConsentState);

  return (
    <MobileLayout
      title="시작하기"
      bottomContent={
        <Btn_1Col onClick={() => navigate("/certificate/step-02")} disabled={!isRequiredComplete}>
          동의하고 계속하기
        </Btn_1Col>
      }
    >
      <ConsentOverviewAccordion
        definition={certificateConsentDefinitionSample}
        preserveState={preserveState}
        basePath="/certificate/step-01"
        preserveStateKey="preserveConsentState"
        resetCarouselCursorKey="resetCategoryCursor"
        title={"인증서 발급을 위해\n약관에 동의해 주세요"}
        description=""
        onRequiredCompleteChange={setIsRequiredComplete}
      />
    </MobileLayout>
  );
}
