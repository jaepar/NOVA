import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { ConsentOverviewAccordion } from "../../components/consent/ConsentOverviewAccordion";
import { accountOpenConsentDefinition } from "../../domains/account-consent/definition.open-account";
import { useTranslation } from "../../i18n";

export function AccountTermsAgreement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [isRequiredComplete, setIsRequiredComplete] = useState(false);
  const preserveState = Boolean(
    (location.state as { preserveStep09State?: boolean } | null)?.preserveStep09State
  );

  return (
    <MobileLayout
      title={t("account.openingHeader")}
      titleKey="account.openingHeader"
      backPath="/account/step-07"
      bottomContent={
        <Btn_1Col
          onClick={() => navigate("/account/step-10")}
          disabled={!isRequiredComplete}
        >
          {t("account.next")}
        </Btn_1Col>
      }
    >
      <ConsentOverviewAccordion
        definition={accountOpenConsentDefinition}
        preserveState={preserveState}
        basePath="/account/step-09"
        preserveStateKey="preserveStep09State"
        resetCarouselCursorKey="resetCategoryCursor"
        translationNamespace="consent.account"
        title={t("account.terms.agreementHeading")}
        description=""
        onRequiredCompleteChange={setIsRequiredComplete}
      />
    </MobileLayout>
  );
}
