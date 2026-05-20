import { Failed } from "../common/Failed";

export function NfcCompareFailed() {
  return (
    <Failed
      headerTitle="비대면 실명확인"
      title="NFC 태깅에 실패했어요"
      description="태깅 위치를 확인한 뒤 다시 시도해 주세요."
      buttonText="다시 시도"
      redirectPath="/certificate/step-06"
    />
  );
}
