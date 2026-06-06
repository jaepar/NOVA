import { useState } from "react";
import { X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Btn_2Col } from "../../components/design-system/Btn_2Col";
import { CenteredTaskContent } from "../../components/design-system/CenteredTaskContent";
import { MobileLayout } from "../../components/layout/MobileLayout";
import {
  getTransferApiError,
  transferApi,
  type SubmitGlobalTransferRequest,
} from "../../../api";
import {
  useTransferBasicInfoPageStore,
  useTransferRecipientInfoPageStore,
  useTransferSenderInfoPageStore,
} from "../../stores/pageStores";

type TransferSubmitFailedLocationState = {
  payload?: SubmitGlobalTransferRequest;
  idempotencyKey?: string;
  message?: string;
};

function getTransferSubmitErrorMessage(error: unknown) {
  const apiError = getTransferApiError(error);

  if (apiError?.message) {
    return apiError.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "잠시 후 다시 시도해 주세요.";
}

export function Step06TransferSubmitFailed() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as TransferSubmitFailedLocationState;
  const [errorMessage, setErrorMessage] = useState(
    state.message ?? "송금 신청 처리 중 오류가 발생했습니다."
  );
  const [isRetrying, setIsRetrying] = useState(false);
  const resetTransferBasicInfo = useTransferBasicInfoPageStore(
    (store) => store.reset
  );
  const resetTransferSenderInfo = useTransferSenderInfoPageStore(
    (store) => store.reset
  );
  const resetTransferRecipientInfo = useTransferRecipientInfoPageStore(
    (store) => store.reset
  );

  const handleHome = () => {
    resetTransferBasicInfo();
    resetTransferSenderInfo();
    resetTransferRecipientInfo();
    navigate("/global-transfer");
  };

  const handleRetry = async () => {
    if (!state.payload || !state.idempotencyKey) {
      navigate("/global-transfer/send/step-05");
      return;
    }

    if (isRetrying) {
      return;
    }

    setIsRetrying(true);

    try {
      await transferApi.submitGlobalTransfer(state.payload, state.idempotencyKey);
      navigate("/global-transfer/send/step-06", { replace: true });
    } catch (error) {
      setErrorMessage(getTransferSubmitErrorMessage(error));
      setIsRetrying(false);
    }
  };

  return (
    <MobileLayout
      title="해외송금"
      headerType="none"
      bottomContent={
        <Btn_2Col
          leftLabel="송금 홈으로"
          rightLabel={isRetrying ? "재요청 중..." : "재요청"}
          onLeftClick={handleHome}
          onRightClick={handleRetry}
        />
      }
    >
      <CenteredTaskContent
        task="송금 신청에 실패했습니다."
        description={`고객님의 송금 신청을 처리하지 못했습니다.\n${errorMessage}`}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <X className="h-10 w-10 stroke-[3] text-red-500" />
        </div>
      </CenteredTaskContent>
    </MobileLayout>
  );
}
