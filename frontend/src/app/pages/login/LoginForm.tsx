import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { AppButton } from '../../components/design-system/AppButton'
import { CommonInputGroup } from '../../components/design-system/CommonInputGroup'
import { useMainPageStore } from '../../stores/pageStores'
import { authApi } from '../../../api'

const LOGIN_FAILED_MESSAGE = '이메일 또는 비밀번호가 일치하지 않습니다.'
const NETWORK_ERROR_MESSAGE = '서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'

function getLoginErrorMessage(error: unknown) {
  if (axios.isAxiosError(error) && error.response) {
    return LOGIN_FAILED_MESSAGE
  }

  return NETWORK_ERROR_MESSAGE
}

export function LoginForm() {
  const navigate = useNavigate()
  const setLoggedIn = useMainPageStore((state) => state.setLoggedIn)
  const setHasAccount = useMainPageStore((state) => state.setHasAccount)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setPasswordVisible] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const canSubmit = email.trim().length > 0 && password.trim().length > 0 && !isSubmitting
  const PasswordIcon = isPasswordVisible ? EyeOff : Eye

  const handleSubmit = async () => {
    if (!canSubmit) {
      return
    }

    setSubmitting(true)
    setErrorMessage('')

    try {
      await authApi.login({ email: email.trim(), password })
      setLoggedIn(true)
      setHasAccount(false)
      navigate('/main')
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MobileLayout
      title="로그인"
      headerType="back"
      backPath="/login"
      bottomContent={
        <Btn_1Col onClick={handleSubmit} disabled={!canSubmit}>
          {isSubmitting ? '처리 중' : '로그인'}
        </Btn_1Col>
      }
    >
      <section className="flex min-h-full flex-col pt-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold leading-tight">
            로그인을 진행할게요
          </h2>
        </section>

        <div className="mt-14 space-y-9">
          <CommonInputGroup
            label="이메일"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(value) => {
              setEmail(value)
              setErrorMessage('')
            }}
          />

          <div className="flex flex-col gap-2">
            <label className="block">비밀번호</label>
            <div className="relative">
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder="비밀번호 입력"
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
                aria-label={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
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