import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { ConsentOverviewAccordion } from '../../components/consent/ConsentOverviewAccordion'
import { certificateConsentDefinitionSample } from '../../domains/definition.sample'
import { useTranslation } from '../../i18n'

export function ConsentTemplate() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [isRequiredComplete, setIsRequiredComplete] = useState(false)
  const preserveState = Boolean(
    (location.state as { preserveConsentState?: boolean } | null)?.preserveConsentState
  )

  return (
    <MobileLayout
      title={t('login.title')}
      bottomContent={
        <Btn_1Col disabled={!isRequiredComplete} onClick={() => navigate('/main')}>
          {t('common.agreeAndContinue')}
        </Btn_1Col>
      }
    >
      <ConsentOverviewAccordion
        definition={certificateConsentDefinitionSample}
        preserveState={preserveState}
        onRequiredCompleteChange={setIsRequiredComplete}
      />
    </MobileLayout>
  )
}


