import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { InlineBanner } from "../../components/design-system/InlineBanner";
import { ConsentOverviewAccordion } from "../../components/consent/ConsentOverviewAccordion";
import { livenessConsentDefinition } from "../../domains/verification-consent/definition.liveness-consent";
import { certificateApi } from "../../../api";
import { useTranslation } from "../../i18n";
import { useLivenessFlowStore } from "../../stores/pageStores";

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
    (location.state as { preserveStep08State?: boolean } | null)?.preserveStep08State
  );

  const handleProceed = async () => {
    if (!isRequiredComplete || isPreparingSession) return;

    setErrorMessage("");
    resetSession();

    setIsPreparingSession(true);
    try {
      const session = await certificateApi.createLivenessSession();
      if (!session?.sessionId || !session?.expiresAt) {
        setErrorMessage(t("certificate.sessionError"));
        return;
      }
      setSession(session.sessionId, session.expiresAt);
      navigate("/certificate/step-09");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setErrorMessage(t("certificate.loginExpired"));
        window.setTimeout(() => navigate("/login/form"), 600);
        return;
      }
      setErrorMessage(t("certificate.sessionCreateFailed"));
    } finally {
      setIsPreparingSession(false);
    }
  };

  // [TEST ONLY START] 생체 인증 과정을 건너뛰고 다음 단계로 이동하는 임시 버튼
  const handleSkipLivenessForTest = () => {
    setErrorMessage("");
    resetSession();
    navigate("/certificate/step-10");
  };
  // [TEST ONLY END]

  return (
    <MobileLayout
      title={t("certificate.title")}
      backPath="/certificate/step-07"
      bottomContent={
        <div className="space-y-2">
          <Btn_1Col
            disabled={!isRequiredComplete || isPreparingSession}
            onClick={handleProceed}
          >
            {isPreparingSession ? t("certificate.preparingCapture") : t("certificate.agreeAndCapture")}
          </Btn_1Col>
          <Btn_1Col variant="outline" onClick={handleSkipLivenessForTest}>
            {t("certificate.livenessSkipTest")}
          </Btn_1Col>
        </div>
      }
    >
      <div className="space-y-3">
        <ConsentOverviewAccordion
          definition={livenessConsentDefinition}
          preserveState={preserveState}
          basePath="/certificate/step-08"
          preserveStateKey="preserveStep08State"
          resetCarouselCursorKey="resetCategoryCursor"
          translationNamespace="consent.certificate"
          title={t("certificate.step08Title")}
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
