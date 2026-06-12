import { useNavigate } from "react-router-dom";
import { Success } from "../common/Success";
import {
  useTransferBasicInfoPageStore,
  useTransferRecipientInfoPageStore,
  useTransferSenderInfoPageStore,
} from "../../stores/pageStores";
import { useTranslation } from "../../i18n";

export function Step06TransferSubmitSuccess() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const resetTransferBasicInfo = useTransferBasicInfoPageStore((state) => state.reset);
  const resetTransferSenderInfo = useTransferSenderInfoPageStore((state) => state.reset);
  const resetTransferRecipientInfo = useTransferRecipientInfoPageStore((state) => state.reset);

  return (
    <Success
      headerTitle={t("globalTransfer.title")}
      headerType="none"
      task={t("globalTransfer.submitSuccess.task")}
      description={t("globalTransfer.submitSuccess.description")}
      buttonText={t("globalTransfer.submitSuccess.confirm")}
      onButtonClick={() => {
        resetTransferBasicInfo();
        resetTransferSenderInfo();
        resetTransferRecipientInfo();
        navigate("/global-transfer");
      }}
    />
  );
}
