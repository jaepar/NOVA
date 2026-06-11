import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { AppButton } from '../../components/design-system/AppButton'
import { CommonInputGroup } from '../../components/design-system/CommonInputGroup'
import { translateError, useTranslation } from '../../i18n'
import { useMainPageStore } from '../../stores/pageStores'
import { authApi } from '../../../api'
import { completeOnboarding } from '../../utils/onboardingStorage'

type LoginLocationState = {
  backPath?: string
  redirectTo?: string
}

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const setAuthenticated = useMainPageStore((state) => state.setAuthenticated)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setPasswordVisible] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const canSubmit = email.trim().length > 0 && password.trim().length > 0 && !isSubmitting
  const PasswordIcon = isPasswordVisible ? EyeOff : Eye
  const locationState = location.state as LoginLocationState | null
  const backPath = locationState?.backPath ?? '/main'
  const redirectTo = locationState?.redirectTo ?? '/main'

  const getLoginErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data as { code?: string; message?: string } | undefined
      return translateError(data?.code, data?.message ?? t('login.failed'))
    }

    return t('login.networkError')
  }

  const handleBack = () => {
    if (backPath === '/login') {
      navigate('/login', { state: { fromLanguage: true } })
      return
    }

    navigate(backPath)
  }

  const handleSubmit = async () => {
    if (!canSubmit) {
      return
    }

    setSubmitting(true)
    setErrorMessage('')

    try {
      const loginResult = await authApi.login({ email: email.trim(), password })
      setAuthenticated(loginResult.userId)
      completeOnboarding()
      navigate(redirectTo)
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MobileLayout
      title="로그인"
      titleKey="login.formTitle"
      headerType="back"
      onBack={handleBack}
      bottomContent={
        <Btn_1Col onClick={handleSubmit} disabled={!canSubmit}>
          {isSubmitting ? t('login.submitting') : t('login.login')}
        </Btn_1Col>
      }
    >
      <section className="flex min-h-full flex-col pt-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold leading-tight">{t('login.formHeading')}</h2>
        </section>

        <div className="mt-14 space-y-9">
          <CommonInputGroup
            label={t('login.email')}
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(value) => {
              setEmail(value)
              setErrorMessage('')
            }}
          />

          <div className="flex flex-col gap-2">
            <label className="block">{t('login.password')}</label>
            <div className="relative">
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setErrorMessage('')
                }}
                autoComplete="current-password"
                className="mt-[6px] w-full rounded-lg border border-border bg-input-background py-3 pl-4 pr-12 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ fontSize: '16px' }}
              />
              <AppButton
                type="button"
                variant="unstyled"
                onClick={() => setPasswordVisible((visible) => !visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={isPasswordVisible ? t('login.hidePassword') : t('login.showPassword')}
              >
                <PasswordIcon className="h-5 w-5" />
              </AppButton>
            </div>
          </div>

          {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
        </div>
      </section>
    </MobileLayout>
  )
}
