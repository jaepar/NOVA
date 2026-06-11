import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { ConsentOverviewAccordion } from '../../components/consent/ConsentOverviewAccordion'
import { certificateConsentDefinition } from '../../domains/certificate-consent/definition.certificate'
import { useTranslation } from '../../i18n'

export function CertificateIssuanceConsentAgreement() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [isRequiredComplete, setIsRequiredComplete] = useState(false)
  const preserveState = Boolean(
    (location.state as { preserveConsentState?: boolean } | null)?.preserveConsentState
  )

  return (
    <MobileLayout
      title={t('certificate.step01Title')}
      backPath="/main"
      bottomContent={
        <Btn_1Col onClick={() => navigate('/certificate/step-02')} disabled={!isRequiredComplete}>
          {t('certificate.agreeAndContinue')}
        </Btn_1Col>
      }
    >
      <ConsentOverviewAccordion
        definition={certificateConsentDefinition}
        preserveState={preserveState}
        basePath="/certificate/step-01"
        preserveStateKey="preserveConsentState"
        resetCarouselCursorKey="resetCategoryCursor"
        translationNamespace="consent.certificateIssuance"
        title={t('certificate.step01Heading')}
        description=""
        onRequiredCompleteChange={setIsRequiredComplete}
      />
    </MobileLayout>
  )
}
