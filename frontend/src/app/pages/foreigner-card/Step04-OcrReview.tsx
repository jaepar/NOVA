import { useNavigate } from 'react-router-dom'
import { Btn_2Col } from '../../components/design-system/Btn_2Col'
import { InlineBanner } from '../../components/design-system/InlineBanner'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useForeignerCardRegistrationStore } from '../../stores/pageStores'

const reviewRows = [
  { key: 'name', label: '성명' },
  { key: 'registrationNumber', label: '주민등록번호' },
  { key: 'issueDate', label: '발급일' },
] as const

const failureMessages: Record<string, string> = {
  IDENTITY_NAME_MISMATCH_WITH_USER: '등록증 이름이 가입자 정보와 일치하지 않습니다.',
  GOVERNMENT_IDENTITY_MISMATCH: '정부 DB의 신원 정보와 일치하지 않습니다.',
}

export function ForeignerCardOcrReview() {
  const navigate = useNavigate()
  const ocrValues = useForeignerCardRegistrationStore((state) => state.ocrValues)
  const verificationStatus = useForeignerCardRegistrationStore((state) => state.verificationStatus)
  const failureReasonCode = useForeignerCardRegistrationStore((state) => state.failureReasonCode)
  const setOcrValue = useForeignerCardRegistrationStore((state) => state.setOcrValue)
  const reset = useForeignerCardRegistrationStore((state) => state.reset)

  const failureMessage = failureReasonCode
    ? failureMessages[failureReasonCode] ?? '인증 결과를 확인해 주세요.'
    : ''

  const handleRetake = () => {
    reset()
    navigate('/foreigner-card/step-03')
  }

  return (
    <MobileLayout
      title="외국인등록증"
      backPath="/foreigner-card/step-03"
      bottomContent={
        <Btn_2Col
          leftLabel="재촬영"
          rightLabel="다음"
          leftVariant="outline"
          rightVariant="primary"
          onLeftClick={handleRetake}
          onRightClick={() => navigate('/foreigner-card/step-05')}
        />
      }
    >
      <div className="space-y-6 pb-2">
        <section className="space-y-2 pt-2">
          <h2 className="text-2xl font-semibold leading-tight">
            틀린 정보를 수정해 주세요
          </h2>
          <p className="text-sm text-muted-foreground">
            외국인 등록증에서 인식한 정보입니다.
          </p>
        </section>

        {verificationStatus === 'FAILED' && failureMessage && (
          <InlineBanner message={failureMessage} variant="error" />
        )}

        <section className="overflow-hidden rounded-2xl border border-border bg-background">
          {reviewRows.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-[140px_1fr] border-b border-border last:border-b-0"
            >
              <div className="flex items-center bg-secondary/20 px-4 py-4">
                <label className="text-base whitespace-nowrap" htmlFor={row.key}>
                  {row.label}
                </label>
              </div>
              <div className="flex items-center px-4 py-4">
                <input
                  id={row.key}
                  type="text"
                  value={ocrValues[row.key]}
                  onChange={(event) => setOcrValue(row.key, event.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-md bg-background px-2 py-1 text-base text-foreground outline-none ring-1 ring-transparent focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          ))}
        </section>
      </div>
    </MobileLayout>
  )
}
