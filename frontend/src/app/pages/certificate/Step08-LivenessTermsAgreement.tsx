import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { ConsentOverviewAccordion } from '../../components/consent/ConsentOverviewAccordion'
import { livenessConsentDefinitionSample } from '../../domains/certificate-consent/definition.liveness.sample'

export function LivenessConsentAgreement() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isRequiredComplete, setIsRequiredComplete] = useState(false)
  const preserveState = Boolean(
    (location.state as { preserveStep08State?: boolean } | null)?.preserveStep08State
  )

  return (
    <MobileLayout
      title="비밀번호 본인확인"
      backPath="/certificate/step-07"
      bottomContent={
        <Btn_1Col disabled={!isRequiredComplete} onClick={() => navigate('/certificate/step-09')}>
          동의하고 촬영하기
        </Btn_1Col>
      }
    >
      <ConsentOverviewAccordion
        definition={livenessConsentDefinitionSample}
        preserveState={preserveState}
        basePath="/certificate/step-08"
        preserveStateKey="preserveStep08State"
        resetCarouselCursorKey="resetCategoryCursor"
        title={'서비스 가입을 위해\n약관에 동의해 주세요'}
        description=""
        onRequiredCompleteChange={setIsRequiredComplete}
      />
    </MobileLayout>
  )
}
