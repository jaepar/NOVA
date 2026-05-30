import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { ConsentOverviewAccordion } from '../../components/consent/ConsentOverviewAccordion'
import { accountOpenConsentDefinition } from '../../domains/account-consent/definition.open-account'

export function AccountTermsAgreement() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isRequiredComplete, setIsRequiredComplete] = useState(false)
  const preserveState = Boolean(
    (location.state as { preserveStep09State?: boolean } | null)?.preserveStep09State
  )

  return (
    <MobileLayout
      title="입출금계좌 개설"
      backPath="/account/step-08"
      bottomContent={
        <Btn_1Col onClick={() => navigate('/account/step-10')} disabled={!isRequiredComplete}>
          다음
        </Btn_1Col>
      }
    >
      <ConsentOverviewAccordion
        definition={accountOpenConsentDefinition}
        preserveState={preserveState}
        basePath="/account/step-09"
        preserveStateKey="preserveStep09State"
        resetCarouselCursorKey="resetCategoryCursor"
        title={'계좌를 개설하기 위해\n약관을 확인해 주세요'}
        description=""
        onRequiredCompleteChange={setIsRequiredComplete}
      />
    </MobileLayout>
  )
}
