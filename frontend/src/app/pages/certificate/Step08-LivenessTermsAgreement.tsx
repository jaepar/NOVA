import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { ConsentOverviewAccordion } from "../../components/consent/ConsentOverviewAccordion";
import { livenessConsentDefinition } from "../../domains/verification-consent/definition.liveness-consent";
import { certificateApi } from "../../../api";
import { useLivenessFlowStore } from "../../stores/pageStores";

export function LivenessConsentAgreement() {
  const navigate = useNavigate();
  const location = useLocation();
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
          "얼굴 인증 세션 생성 응답이 올바르지 않습니다. 다시 시도해 주세요."
        );
        return;
      }
      setSession(session.sessionId, session.expiresAt);
      navigate("/certificate/step-09");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setErrorMessage("로그인이 만료되었습니다. 다시 로그인해 주세요.");
        window.setTimeout(() => navigate("/login/form"), 600);
        return;
      }
      setErrorMessage(
        "얼굴 인증 세션 생성에 실패했습니다. 잠시 후 다시 시도해 주세요."
      );
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
      title="비대면 실명확인"
      backPath="/certificate/step-07"
      bottomContent={
        <div className="space-y-2">
          <Btn_1Col
            disabled={!isRequiredComplete || isPreparingSession}
            onClick={handleProceed}
          >
            {isPreparingSession ? "촬영 준비 중..." : "동의하고 촬영하기"}
          </Btn_1Col>
          <Btn_1Col variant="outline" onClick={handleSkipLivenessForTest}>
            인증 없이 다음으로 (테스트)
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
          title={"서비스 가입을 위해\n약관에 동의해 주세요"}
          description=""
          onRequiredCompleteChange={setIsRequiredComplete}
        />
        {errorMessage && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
      </div>
    </MobileLayout>
  );
}



