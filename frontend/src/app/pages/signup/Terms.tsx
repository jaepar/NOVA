import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { ConsentOverviewAccordion } from "../../components/consent/ConsentOverviewAccordion";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { signupConsentDefinition } from "./consentDefinition";

export function Terms() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRequiredComplete, setIsRequiredComplete] = useState(false);
  const preserveState = Boolean((location.state as { preserveConsentState?: boolean } | null)?.preserveConsentState);

  return (
    <MobileLayout
      title="회원가입"
      backPath="/signup/personal-info"
      bottomContent={
        <Btn_1Col disabled={!isRequiredComplete} onClick={() => navigate("/signup/password")}>
          다음으로
        </Btn_1Col>
      }
    >
      <div className="pt-6">
        <ConsentOverviewAccordion
          definition={signupConsentDefinition}
          preserveState={preserveState}
          basePath="/signup/terms"
          title="약관 동의"
          description="서비스 이용을 위해 아래 약관을 읽고 동의해주세요."
          onRequiredCompleteChange={setIsRequiredComplete}
        />
      </div>
    </MobileLayout>
  );
}
