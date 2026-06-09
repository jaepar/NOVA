import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { certificateApi, getCertificateApiError } from "../../../api";
import { novaToast } from "../../components/design-system";
import { Success } from "../common/Success";

export function CertificateRequestCompleted() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await certificateApi.requestIssuance();
      navigate("/main");
    } catch (error) {
      const apiError = getCertificateApiError(error);
      novaToast.error(apiError?.message || "인증서 발급 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Success
      headerTitle="비대면 실명확인"
      task="인증서 발급 요청이 완료 되었어요"
      description={"인증서 발급까지 평균 3시간~5시간이 필요합니다.\n발급이 완료되면 알림으로 안내드릴게요."}
      buttonText={isSubmitting ? "처리 중..." : "확인"}
      buttonDisabled={isSubmitting}
      onButtonClick={handleConfirm}
      headerType="none"
    />
  );
}
