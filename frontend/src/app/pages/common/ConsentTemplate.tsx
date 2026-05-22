import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { ConsentOverviewAccordion } from '../../components/consent/ConsentOverviewAccordion'
import { certificateConsentDefinitionSample } from '../../domains/certificate-consent/definition.sample'

export function ConsentTemplate() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isRequiredComplete, setIsRequiredComplete] = useState(false)
  const preserveState = Boolean(
    (location.state as { preserveConsentState?: boolean } | null)?.preserveConsentState
  )

  return (
    <MobileLayout
      title="시작하기"
      bottomContent={
        <Btn_1Col disabled={!isRequiredComplete} onClick={() => navigate('/main')}>
          동의하고 계속하기
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
