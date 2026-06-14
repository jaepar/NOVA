import { useState } from "react";
import { X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Btn_2Col } from "../../components/design-system/Btn_2Col";
import { CenteredTaskContent } from "../../components/design-system/CenteredTaskContent";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { getTransferApiError, transferApi, type SubmitRemittanceRequest } from "../../../api";
import {
  useTransferBasicInfoPageStore,
  useTransferRecipientInfoPageStore,
  useTransferSenderInfoPageStore,
} from "../../stores/pageStores";
import { translateError, useTranslation } from "../../i18n";

type TransferSubmitFailedLocationState = {
  payload?: SubmitRemittanceRequest;
  translatedMessage?: string;
};

function getTransferSubmitErrorMessage(error: unknown, fallback: string) {
  const apiError = getTransferApiError(error);
  return translateError(apiError?.code, fallback);
}

export function Step06TransferSubmitFailed() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const state = (location.state ?? {}) as TransferSubmitFailedLocationState;
  const [errorMessage, setErrorMessage] = useState(
    state.translatedMessage ?? t("globalTransfer.submitFailed.defaultError")
  );
  const [isRetrying, setIsRetrying] = useState(false);
  const resetTransferBasicInfo = useTransferBasicInfoPageStore((store) => store.reset);
  const resetTransferSenderInfo = useTransferSenderInfoPageStore((store) => store.reset);
  const resetTransferRecipientInfo = useTransferRecipientInfoPageStore((store) => store.reset);

  const handleHome = () => {
    resetTransferBasicInfo();
    resetTransferSenderInfo();
    resetTransferRecipientInfo();
    navigate("/global-transfer");
  };

  const handleRetry = async () => {
    if (!state.payload) {
      navigate("/global-transfer/send/step-05");
      return;
    }

    if (isRetrying) {
      return;
    }

    setIsRetrying(true);

    try {
      await transferApi.submitRemittance(state.payload);
      navigate("/global-transfer/send/step-06", { replace: true });
    } catch (error) {
      setErrorMessage(
        getTransferSubmitErrorMessage(error, t("globalTransfer.submitFailed.fallbackError"))
      );
      setIsRetrying(false);
    }
  };

  return (
    <MobileLayout
      title={t("globalTransfer.title")}
      headerType="none"
      bottomContent={
        <Btn_2Col
          leftLabel={t("globalTransfer.submitFailed.toHome")}
          rightLabel={
            isRetrying
              ? t("globalTransfer.submitFailed.retrying")
              : t("globalTransfer.submitFailed.retry")
          }
          onLeftClick={handleHome}
          onRightClick={handleRetry}
        />
      }
    >
      <CenteredTaskContent
        task={t("globalTransfer.submitFailed.task")}
        description={`${t("globalTransfer.submitFailed.description")}\n${errorMessage}`}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <X className="h-10 w-10 stroke-[3] text-red-500" />
        </div>
      </CenteredTaskContent>
    </MobileLayout>
  );
}
