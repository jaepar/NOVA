import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { AppButton } from '../../components/design-system/AppButton'
import { emailVerificationApi, getEmailVerificationApiError } from '../../../api'
import { translateError, useTranslation } from '../../i18n'
import { useSignupPageStore } from '../../stores/pageStores'
import { SignupContent } from './components/SignupContent'
import { SignupInputGroup } from './components/SignupInputGroup'

const verificationExpiresSeconds = 5 * 60

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0')

  return `${minutes}:${remainingSeconds}`
}

export function EmailVerification() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const email = useSignupPageStore((state) => state.email)
  const verificationCode = useSignupPageStore((state) => state.verificationCode)
  const setEmail = useSignupPageStore((state) => state.setEmail)
  const setVerificationCode = useSignupPageStore((state) => state.setVerificationCode)
  const resetSignup = useSignupPageStore((state) => state.resetSignup)
  const [isCodeSent, setCodeSent] = useState(false)
  const [isSendingCode, setSendingCode] = useState(false)
  const [isVerifying, setVerifying] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [sendErrorMessage, setSendErrorMessage] = useState('')
  const [confirmErrorMessage, setConfirmErrorMessage] = useState('')

  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email])
  const canSendCode = isEmailValid && !isSendingCode && !isVerifying
  const canContinue =
    isCodeSent &&
    remainingSeconds > 0 &&
    verificationCode.length === 6 &&
    !isSendingCode &&
    !isVerifying
  const getTranslatedErrorMessage = (error: unknown, fallbackKey: string) => {
    const apiError = getEmailVerificationApiError(error)
    return translateError(apiError?.code, apiError?.message || t(fallbackKey))
  }

  useEffect(() => {
    if (!isCodeSent || remainingSeconds === 0) {
      return
    }

    const timerId = window.setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(seconds - 1, 0))
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [isCodeSent, remainingSeconds])

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setVerificationCode('')
    setCodeSent(false)
    setRemainingSeconds(0)
    setSendErrorMessage('')
    setConfirmErrorMessage('')
  }

  const handleVerificationCodeChange = (value: string) => {
    setVerificationCode(value.replace(/\D/g, '').slice(0, 6))
    setConfirmErrorMessage('')
  }

  const handleSendVerification = async () => {
    if (!canSendCode) {
      return
    }

    setSendingCode(true)
    setSendErrorMessage('')
    setConfirmErrorMessage('')

    try {
      await emailVerificationApi.sendForSignup(email)
      setVerificationCode('')
      setCodeSent(true)
      setRemainingSeconds(verificationExpiresSeconds)
    } catch (error) {
      setCodeSent(false)
      setRemainingSeconds(0)
      setVerificationCode('')
      setSendErrorMessage(getTranslatedErrorMessage(error, 'signup.emailSendFailed'))
    } finally {
      setSendingCode(false)
    }
  }

  const handleConfirmVerification = async () => {
    if (!canContinue) {
      return
    }

    setVerifying(true)
    setConfirmErrorMessage('')

    try {
      await emailVerificationApi.confirm(email, verificationCode)
      navigate('/signup/personal-info')
    } catch (error) {
      setConfirmErrorMessage(getTranslatedErrorMessage(error, 'signup.emailConfirmFailed'))
    } finally {
      setVerifying(false)
    }
  }

  const handleBack = () => {
    resetSignup()
    navigate('/login', { state: { fromLanguage: true } })
  }

  return (
    <MobileLayout
      title={t('signup.title')}
      titleKey="signup.title"
      onBack={handleBack}
      bottomContent={
        <Btn_1Col onClick={handleConfirmVerification} disabled={!canContinue}>
          {isVerifying ? t('signup.verifying') : t('signup.next')}
        </Btn_1Col>
      }
    >
      <SignupContent className="space-y-10">
        <section className="space-y-3">
          <h2 className="whitespace-pre-line text-2xl font-semibold leading-tight">
            {t('signup.emailHeading')}
          </h2>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <SignupInputGroup
              label={t('signup.email')}
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={handleEmailChange}
              disabled={isSendingCode || isVerifying}
              autoComplete="email"
              rightContent={
                <AppButton
                  type="button"
                  variant="unstyled"
                  onClick={handleSendVerification}
                  disabled={!canSendCode}
                  className="text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:text-muted-foreground"
                >
                  {isSendingCode ? t('signup.sending') : isCodeSent ? t('signup.resend') : t('signup.getCode')}
                </AppButton>
              }
            />
            {email && !isEmailValid && (
              <p className="text-sm text-red-500">{t('signup.invalidEmail')}</p>
            )}
            {sendErrorMessage && (
              <p className="text-sm text-red-500">{sendErrorMessage}</p>
            )}
            {isCodeSent && (
              <p className="text-sm text-muted-foreground">{t('signup.codeSent')}</p>
            )}
          </div>

          <div className="space-y-2">
            <SignupInputGroup
              label={t('signup.code')}
              placeholder={t('signup.codePlaceholder')}
              value={verificationCode}
              onChange={handleVerificationCodeChange}
              disabled={!isCodeSent || isSendingCode || isVerifying}
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
            />
            {isCodeSent && remainingSeconds > 0 && (
              <p className="text-sm font-medium text-red-500">
                {t('signup.remainingTime')} {formatTimer(remainingSeconds)}
              </p>
            )}
            {isCodeSent && remainingSeconds === 0 && (
              <p className="text-sm text-red-500">{t('signup.expired')}</p>
            )}
            {confirmErrorMessage && <p className="text-sm text-red-500">{confirmErrorMessage}</p>}
          </div>
        </section>
      </SignupContent>
    </MobileLayout>
  )
}
