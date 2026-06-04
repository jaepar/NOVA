import { useNavigate } from "react-router-dom";
import { Success } from "../common/Success";
import {
  useTransferBasicInfoPageStore,
  useTransferRecipientInfoPageStore,
  useTransferSenderInfoPageStore,
} from "../../stores/pageStores";

export function Step06TransferSubmitSuccess() {
  const navigate = useNavigate();
  const resetTransferBasicInfo = useTransferBasicInfoPageStore(
    (state) => state.reset
  );
  const resetTransferSenderInfo = useTransferSenderInfoPageStore(
    (state) => state.reset
  );
  const resetTransferRecipientInfo = useTransferRecipientInfoPageStore(
    (state) => state.reset
  );

  return (
    <Success
      headerTitle="해외송금"
      headerType="none"
      task="송금 신청이 완료되었습니다."
      description="고객님의 송금 신청이 정상적으로 처리되었습니다"
      buttonText="확인"
      onButtonClick={() => {
        resetTransferBasicInfo();
        resetTransferSenderInfo();
        resetTransferRecipientInfo();
        navigate("/global-transfer");
      }}
    />
  );
}
