import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { AppButton } from '../../components/design-system/AppButton'
import { emailVerificationApi, getEmailVerificationApiErrorMessage } from '../../../api'
import { useTranslation } from '../../i18n'
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
  const [errorMessage, setErrorMessage] = useState('')

  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email])
  const canSendCode = isEmailValid && !isSendingCode && !isVerifying
  const canContinue =
    isCodeSent &&
    remainingSeconds > 0 &&
    verificationCode.length === 6 &&
    !isSendingCode &&
    !isVerifying

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
    setErrorMessage('')
  }

  const handleVerificationCodeChange = (value: string) => {
    setVerificationCode(value.replace(/\D/g, '').slice(0, 6))
    setErrorMessage('')
  }

  const handleSendVerification = async () => {
    if (!canSendCode) {
      return
    }

    setSendingCode(true)
    setErrorMessage('')

    try {
      await emailVerificationApi.send(email)
      setVerificationCode('')
      setCodeSent(true)
      setRemainingSeconds(verificationExpiresSeconds)
    } catch (error) {
      setErrorMessage(getEmailVerificationApiErrorMessage(error))
    } finally {
      setSendingCode(false)
    }
  }

  const handleConfirmVerification = async () => {
    if (!canContinue) {
      return
    }

    setVerifying(true)
    setErrorMessage('')

    try {
      await emailVerificationApi.confirm(email, verificationCode)
      navigate('/signup/personal-info')
    } catch (error) {
      setErrorMessage(getEmailVerificationApiErrorMessage(error))
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
      title="회원가입"
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
            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
          </div>
        </section>
      </SignupContent>
    </MobileLayout>
  )
}
