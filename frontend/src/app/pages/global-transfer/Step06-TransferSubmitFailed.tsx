import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Failed } from "../common/Failed";
import {
  bankingApi,
  getBankingApiError,
  type CreateGlobalTransactionRequest,
} from "../../../api";
import {
  useTransferBasicInfoPageStore,
  useTransferRecipientInfoPageStore,
  useTransferSenderInfoPageStore,
} from "../../stores/pageStores";
import { translateError, useTranslation } from "../../i18n";

type TransferSubmitFailedLocationState = {
  payload?: CreateGlobalTransactionRequest;
  idempotencyKey?: string;
  translatedMessage?: string;
};

function getTransferSubmitErrorMessage(error: unknown, fallback: string) {
  const apiError = getBankingApiError(error);
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
    if (!state.payload || !state.idempotencyKey) {
      navigate("/global-transfer/send/step-05");
      return;
    }

    if (isRetrying) {
      return;
    }

    setIsRetrying(true);

    try {
      await bankingApi.createGlobalTransaction(state.payload, state.idempotencyKey);
      navigate("/global-transfer/send/step-06", { replace: true });
    } catch (error) {
      setErrorMessage(
        getTransferSubmitErrorMessage(error, t("globalTransfer.submitFailed.fallbackError"))
      );
      setIsRetrying(false);
    }
  };

  return (
    <Failed
      headerTitle={t("globalTransfer.title")}
      headerType="none"
      task={t("globalTransfer.submitFailed.task")}
      description={`${t("globalTransfer.submitFailed.description")}\n${errorMessage}`}
      secondaryButtonText={t("globalTransfer.submitFailed.toHome")}
      buttonText={
        isRetrying
          ? t("globalTransfer.submitFailed.retrying")
          : t("globalTransfer.submitFailed.retry")
      }
      buttonDisabled={isRetrying}
      onSecondaryButtonClick={handleHome}
      onButtonClick={handleRetry}
    />
  );
}
