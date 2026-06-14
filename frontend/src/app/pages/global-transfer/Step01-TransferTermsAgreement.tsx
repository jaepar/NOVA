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
import { useTranslation } from "../../i18n";

export function TransferTermsAgreement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
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
      title={t("globalTransfer.title")}
      backPath="/global-transfer"
      bottomContent={
        <div className="flex w-full gap-4">
          <AppButton
            variant="outline"
            onClick={() => navigate("/global-transfer")}
            className="flex-1 rounded-xl px-6 py-4"
          >
            {t("globalTransfer.terms.cancel")}
          </AppButton>
          <AppButton
            variant="primary"
            disabled={!isRequiredComplete}
            onClick={() => {
              resetTransferBasicInfo();
              resetTransferSenderInfo();
              resetTransferRecipientInfo();
              navigate('/global-transfer/send/step-02');
            }}
            className="flex-1 rounded-xl px-6 py-4"
          >
            {t("globalTransfer.terms.next")}
          </AppButton>
        </div>
      }
    >
      <div className="space-y-8 pt-3">
        <section className="space-y-5">
          <h1 className="text-[24px] font-semibold leading-tight text-[#132347]">
            {t("globalTransfer.terms.heading")}
          </h1>
        </section>

        <ConsentOverviewAccordion
          definition={transferConsentDefinition}
          preserveState={preserveState}
          basePath="/global-transfer/send/step-01"
          preserveStateKey="preserveConsentState"
          resetCarouselCursorKey="resetCategoryCursor"
          translationNamespace="consent.transfer"
          title=""
          description=""
          onRequiredCompleteChange={setIsRequiredComplete}
        />
      </div>
    </MobileLayout>
  );
}
