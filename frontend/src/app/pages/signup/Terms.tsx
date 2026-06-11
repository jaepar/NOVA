import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { ConsentOverviewAccordion } from "../../components/consent/ConsentOverviewAccordion";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { resetConsentStorage } from "../../domains/storage";
import { signupConsentDefinition } from "../../domains/signup-consent/definition.signup";
import { useTranslation } from "../../i18n";
import { useSignupPageStore } from "../../stores/pageStores";

export function Terms() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
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
      title={t('signup.title')}
      onBack={handleBack}
      bottomContent={
        <Btn_1Col
          disabled={!isRequiredComplete}
          onClick={() => navigate("/signup/password")}
        >
          {t('signup.next')}
        </Btn_1Col>
      }
    >
      <div className="pt-6">
        <ConsentOverviewAccordion
          definition={signupConsentDefinition}
          preserveState={preserveState}
          basePath="/signup"
          title={t('signup.termsTitle')}
          description={t('signup.termsDescription')}
          onRequiredCompleteChange={setIsRequiredComplete}
        />
      </div>
    </MobileLayout>
  );
}
