import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { ConsentOverviewAccordion } from "../../components/consent/ConsentOverviewAccordion";
import { livenessConsentDefinitionSample } from "../../domains/certificate-consent/definition.liveness.sample";

export function LivenessConsentAgreement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRequiredComplete, setIsRequiredComplete] = useState(false);
  const preserveState = Boolean((location.state as { preserveStep10State?: boolean } | null)?.preserveStep10State);

  return (
    <MobileLayout
      title="비밀번호 신원확인"
      bottomContent={
        <Btn_1Col disabled={!isRequiredComplete} onClick={() => navigate("/certificate/step-11")}>
          동의하고 촬영하기
        </Btn_1Col>
      }
    >
      <ConsentOverviewAccordion
        definition={livenessConsentDefinitionSample}
        preserveState={preserveState}
        basePath="/certificate/step-10"
        preserveStateKey="preserveStep10State"
        resetCarouselCursorKey="resetCategoryCursor"
        title={"서비스 가입을 위해\n약관에 동의해 주세요"}
        description=""
        onRequiredCompleteChange={setIsRequiredComplete}
      />
    </MobileLayout>
  );
}
