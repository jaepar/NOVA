import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { InlineBanner } from "../../components/design-system/InlineBanner";
import { ConsentOverviewAccordion } from "../../components/consent/ConsentOverviewAccordion";
import { livenessConsentDefinition } from "../../domains/verification-consent/definition.liveness-consent";
import { certificateApi } from "../../../api";
import { useLivenessFlowStore } from "../../stores/pageStores";
import { useTranslation } from "../../i18n";

export function LivenessConsentAgreement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const setSession = useLivenessFlowStore((state) => state.setSession);
  const resetSession = useLivenessFlowStore((state) => state.resetSession);
  const [isRequiredComplete, setIsRequiredComplete] = useState(false);
  const [isPreparingSession, setIsPreparingSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const preserveState = Boolean(
    (location.state as { preserveStep08State?: boolean } | null)
      ?.preserveStep08State
  );
  const handleProceed = async () => {
    if (!isRequiredComplete || isPreparingSession) return;

    setErrorMessage("");
    resetSession();

    setIsPreparingSession(true);
    try {
      const session = await certificateApi.createLivenessSession();
      if (!session?.sessionId || !session?.expiresAt) {
        setErrorMessage(
          t("account.livenessTerms.invalidSession")
        );
        return;
      }
      setSession(session.sessionId, session.expiresAt);
      navigate("/account/step-08");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setErrorMessage(t("account.livenessTerms.loginExpired"));
        window.setTimeout(() => navigate("/login/form"), 600);
        return;
      }
      setErrorMessage(
        t("account.livenessTerms.createFailed")
      );
    } finally {
      setIsPreparingSession(false);
    }
  };

  // [TEST ONLY START] 생체 인증 과정을 건너뛰고 다음 단계로 이동하는 임시 버튼
  const handleSkipLivenessForTest = () => {
    setErrorMessage("");
    resetSession();
    navigate("/account/step-09");
  };
  // [TEST ONLY END]

  return (
    <MobileLayout
      title={t("account.identityTitle")}
      titleKey="account.identityTitle"
      backPath="/account/step-06"
      bottomContent={
        <div className="space-y-2">
          <Btn_1Col
            disabled={!isRequiredComplete || isPreparingSession}
            onClick={handleProceed}
          >
            {isPreparingSession
              ? t("account.livenessTerms.preparing")
              : t("account.livenessTerms.agreeAndCapture")}
          </Btn_1Col>
          <Btn_1Col variant="outline" onClick={handleSkipLivenessForTest}>
            {t("account.livenessTerms.skipTest")}
          </Btn_1Col>
        </div>
      }
    >
      <div className="space-y-3">
        <ConsentOverviewAccordion
          definition={livenessConsentDefinition}
          preserveState={preserveState}
          basePath="/account/step-07"
          preserveStateKey="preserveStep08State"
          resetCarouselCursorKey="resetCategoryCursor"
          translationNamespace="consent.certificate"
          title={t("account.livenessTerms.title")}
          description=""
          onRequiredCompleteChange={setIsRequiredComplete}
        />
        {errorMessage && (
          <InlineBanner message={errorMessage} variant="error" />
        )}
      </div>
    </MobileLayout>
  );
}



