import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { certificateApi, getCertificateApiError } from '../../../api'
import { Btn_2Col } from '../../components/design-system/Btn_2Col'
import { InlineBanner } from '../../components/design-system/InlineBanner'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useTranslation } from '../../i18n'
import { useForeignerCardRegistrationStore } from '../../stores/pageStores'

export function ForeignerCardOcrReview() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const ocrValues = useForeignerCardRegistrationStore((state) => state.ocrValues)
  const setOcrValue = useForeignerCardRegistrationStore((state) => state.setOcrValue)
  const setVerificationResult = useForeignerCardRegistrationStore(
    (state) => state.setVerificationResult,
  )
  const reset = useForeignerCardRegistrationStore((state) => state.reset)
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [isConfirmErrorVisible, setIsConfirmErrorVisible] = useState(false)

  const reviewRows = [
    { key: 'name' as const, label: t('foreignerCard.labelName') },
    { key: 'registrationNumber' as const, label: t('foreignerCard.labelRegNumber') },
    { key: 'issueDate' as const, label: t('foreignerCard.labelIssueDate') },
  ]

  const failureMessages: Record<string, string> = {
    IDENTITY_NAME_MISMATCH_WITH_USER: t('foreignerCard.failureIdentityNameMismatch'),
    GOVERNMENT_IDENTITY_MISMATCH: t('foreignerCard.failureGovernmentMismatch'),
  }

  function getConfirmApiErrorMessage(error: unknown) {
    const apiError = getCertificateApiError(error)

    switch (apiError?.code) {
      case 'USER-018':
        return t('foreignerCard.failureIdentityNameMismatch')
      case 'USER-020':
        return t('foreignerCard.confirmError020')
      case 'USER-021':
        return t('foreignerCard.ocrError021')
      case 'USER-022':
        return t('foreignerCard.confirmError022')
      default:
        return apiError?.message || t('foreignerCard.confirmErrorDefault')
    }
  }

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
      setConfirmError(t('foreignerCard.reviewRequired'))
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
          ? (failureMessages[response.failureReasonCode] ?? t('foreignerCard.failureDefault'))
          : t('foreignerCard.reviewCheckError'),
      )
    } catch (error) {
      setConfirmError(getConfirmApiErrorMessage(error))
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <MobileLayout
      title={t('foreignerCard.title')}
      backPath="/foreigner-card/step-03"
      bottomContent={
        <Btn_2Col
          leftLabel={t('foreignerCard.retake')}
          rightLabel={isConfirming ? t('foreignerCard.confirming') : t('common.next')}
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
            {t('foreignerCard.reviewTitle')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('foreignerCard.reviewSubtitle')}
          </p>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-background">
          {reviewRows.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-[140px_1fr] border-b border-border last:border-b-0"
            >
              <div className="flex items-center bg-secondary/20 px-4 py-4">
                <label className="min-w-0 text-base leading-tight break-words" htmlFor={row.key}>
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
                  className="w-full min-w-0 rounded-md bg-background px-2 py-1 text-base text-foreground outline-none ring-1 ring-transparent focus:ring-2 focus:ring-primary"
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
            {t('foreignerCard.ocrVerifying')}
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
