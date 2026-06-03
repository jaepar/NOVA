import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppButton } from "../../components/design-system/AppButton";
import { ConsentOverviewAccordion } from "../../components/consent/ConsentOverviewAccordion";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { transferConsentDefinition } from "../../domains/transfer-consent/definition.transfer";
import {
  useTransferBasicInfoPageStore,
  useTransferRecipientInfoPageStore,
  useTransferSenderInfoPageStore,
} from "../../stores/pageStores";

export function TransferTermsAgreement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRequiredComplete, setIsRequiredComplete] = useState(false);
  const preserveState = Boolean(
    (location.state as { preserveConsentState?: boolean } | null)?.preserveConsentState
  );
  const resetTransferBasicInfo = useTransferBasicInfoPageStore((state) => state.reset);
  const resetTransferSenderInfo = useTransferSenderInfoPageStore((state) => state.reset);
  const resetTransferRecipientInfo = useTransferRecipientInfoPageStore(
    (state) => state.reset
  );

  return (
    <MobileLayout
      title="해외송금"
      backPath="/transfer"
      bottomContent={
        <div className="flex w-full gap-4">
          <AppButton
            variant="outline"
            onClick={() => navigate("/transfer")}
            className="flex-1 rounded-xl px-6 py-4"
          >
            취소
          </AppButton>
          <AppButton
            variant="primary"
            disabled={!isRequiredComplete}
            onClick={() => {
              resetTransferBasicInfo();
              resetTransferSenderInfo();
              resetTransferRecipientInfo();
              navigate('/transfer/send/step-02');
            }}
            className="flex-1 rounded-xl px-6 py-4"
          >
            다음
          </AppButton>
        </div>
      }
    >
      <div className="space-y-8 pt-3">
        <section className="space-y-5">
          <h1 className="text-[24px] font-semibold leading-tight text-[#132347]">
            서비스 이용동의 선택
          </h1>
        </section>

        <ConsentOverviewAccordion
          definition={transferConsentDefinition}
          preserveState={preserveState}
          basePath="/transfer/send/step-01"
          preserveStateKey="preserveConsentState"
          resetCarouselCursorKey="resetCategoryCursor"
          title=""
          description=""
          onRequiredCompleteChange={setIsRequiredComplete}
        />
      </div>
    </MobileLayout>
  );
}
