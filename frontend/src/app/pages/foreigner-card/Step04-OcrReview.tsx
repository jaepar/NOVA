import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { certificateApi, getCertificateApiError } from '../../../api'
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
  GOVERNMENT_IDENTITY_MISMATCH: '신원 정보가 정확하지 않습니다.',
}

function getConfirmApiErrorMessage(error: unknown) {
  const apiError = getCertificateApiError(error)

  switch (apiError?.code) {
    case 'USER-018':
      return '등록증 이름이 가입자 정보와 일치하지 않습니다.'
    case 'USER-020':
      return '신원 정보가 정확하지 않습니다. 입력 정보를 다시 확인해 주세요.'
    case 'USER-021':
      return '신원 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.'
    case 'USER-022':
      return '외국인등록증 인증 요청 형식이 올바르지 않습니다.'
    default:
      return apiError?.message || '외국인등록증 인증 중 오류가 발생했습니다. 다시 시도해 주세요.'
  }
}

export function ForeignerCardOcrReview() {
  const navigate = useNavigate()
  const ocrValues = useForeignerCardRegistrationStore((state) => state.ocrValues)
  const setOcrValue = useForeignerCardRegistrationStore((state) => state.setOcrValue)
  const setVerificationResult = useForeignerCardRegistrationStore(
    (state) => state.setVerificationResult,
  )
  const reset = useForeignerCardRegistrationStore((state) => state.reset)
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [isConfirmErrorVisible, setIsConfirmErrorVisible] = useState(false)

  useEffect(() => {
    if (!confirmError) {
      setIsConfirmErrorVisible(false)
      return
    }

    const enterTimerId = window.setTimeout(() => {
      setIsConfirmErrorVisible(true)
    }, 20)
    const exitTimerId = window.setTimeout(() => {
      setIsConfirmErrorVisible(false)
    }, 2700)
    const clearTimerId = window.setTimeout(() => {
      setConfirmError(null)
    }, 3000)

    return () => {
      window.clearTimeout(enterTimerId)
      window.clearTimeout(exitTimerId)
      window.clearTimeout(clearTimerId)
    }
  }, [confirmError])

  const handleRetake = () => {
    reset()
    navigate('/foreigner-card/step-03')
  }

  const handleConfirm = async () => {
    if (isConfirming) {
      return
    }

    const name = ocrValues.name.trim()
    const residentRegistrationNumber = ocrValues.registrationNumber.trim()
    const issueDate = ocrValues.issueDate.trim()

    if (!name || !residentRegistrationNumber || !issueDate) {
      setConfirmError('성명, 주민등록번호, 발급일을 모두 입력해 주세요.')
      return
    }

    setConfirmError(null)
    setIsConfirming(true)

    try {
      const response = await certificateApi.confirmIdentity({
        ocrDocumentType: 'ID_CARD',
        name,
        residentRegistrationNumber,
        issueDate,
      })

      setVerificationResult(response.verificationStatus, response.failureReasonCode)

      if (
        response.verificationStatus === 'VERIFIED' &&
        response.nameMatchWithUser &&
        response.identityMatchWithGovDb
      ) {
        navigate('/foreigner-card/step-05')
        return
      }

      setConfirmError(
        response.failureReasonCode
          ? failureMessages[response.failureReasonCode] ?? '인증 결과를 확인해 주세요.'
          : '입력한 외국인등록증 정보를 다시 확인해 주세요.',
      )
    } catch (error) {
      setConfirmError(getConfirmApiErrorMessage(error))
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <MobileLayout
      title="외국인등록증 등록"
      backPath="/foreigner-card/step-03"
      bottomContent={
        <Btn_2Col
          leftLabel="재촬영"
          rightLabel={isConfirming ? '확인 중...' : '다음'}
          leftVariant="outline"
          rightVariant="primary"
          onLeftClick={handleRetake}
          onRightClick={handleConfirm}
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
        {confirmError && (
          <div
            className={`transform-gpu transition-all duration-300 ease-out ${
              isConfirmErrorVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <InlineBanner message={confirmError} variant="error" />
          </div>
        )}
        {isConfirming && (
          <div className="rounded-xl border border-border bg-secondary p-3 text-center text-sm text-muted-foreground">
            외국인등록증 정보를 확인하고 있습니다. 잠시만 기다려 주세요.
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
