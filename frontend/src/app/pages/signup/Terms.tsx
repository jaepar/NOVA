import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { ConsentOverviewAccordion } from "../../components/consent/ConsentOverviewAccordion";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { resetConsentStorage } from "../../domains/storage";
import { signupConsentDefinition } from "../../domains/signup-consent/definition.signup";
import { useSignupPageStore } from "../../stores/pageStores";

export function Terms() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRequiredComplete, setIsRequiredComplete] = useState(false);
  const resetPersonalInfo = useSignupPageStore(
    (state) => state.resetPersonalInfo
  );
  const preserveState = Boolean(
    (location.state as { preserveConsentState?: boolean } | null)
      ?.preserveConsentState
  );

  const handleBack = () => {
    resetPersonalInfo();
    resetConsentStorage();
    navigate("/signup/personal-info");
  };

  return (
    <MobileLayout
      title="회원가입"
      onBack={handleBack}
      bottomContent={
        <Btn_1Col
          disabled={!isRequiredComplete}
          onClick={() => navigate("/signup/password")}
        >
          다음
        </Btn_1Col>
      }
    >
      <div className="pt-6">
        <ConsentOverviewAccordion
          definition={signupConsentDefinition}
          preserveState={preserveState}
          basePath="/signup"
          title="약관 동의"
          description="서비스 이용을 위해 아래 약관을 읽고 동의해주세요."
          onRequiredCompleteChange={setIsRequiredComplete}
        />
      </div>
    </MobileLayout>
  );
}
