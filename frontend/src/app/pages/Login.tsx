import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileLayout } from '../components/layout/MobileLayout'
import { Btn_1Col } from '../components/design-system/Btn_1Col'
import { CommonInputGroup } from '../components/design-system/CommonInputGroup'
import { useMainPageStore } from '../stores/pageStores'
import { authApi } from '../../api'

function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response
    const message = response?.data?.message

    if (typeof message === 'string' && message.length > 0) {
      return message
    }
  }

  return fallbackMessage
}

export function Login() {
  const navigate = useNavigate()
  const setLoggedIn = useMainPageStore((state) => state.setLoggedIn)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const canSubmit = email.trim().length > 0 && password.trim().length > 0 && !isSubmitting

  const handleLogin = async () => {
    if (!canSubmit) {
      return
    }

    setSubmitting(true)
    setErrorMessage('')

    try {
      await authApi.login({ email: email.trim(), password })
      setLoggedIn(true)
      navigate('/main')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MobileLayout
      title="로그인"
      bottomContent={
        <Btn_1Col onClick={handleLogin} disabled={!canSubmit}>
          {isSubmitting ? '처리 중' : '로그인'}
        </Btn_1Col>
      }
    >
      <div className="flex h-full flex-col">
        <div className="pb-4">
          <h2>반가워요!</h2>
          <p className="mt-2 text-muted-foreground">로그인을 진행해주세요</p>
        </div>

        <div className="mt-10 space-y-6">
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

          <CommonInputGroup
            label="비밀번호"
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(value) => {
              setPassword(value)
              setErrorMessage('')
            }}
          />

          {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
        </div>
      </div>
    </MobileLayout>
  )
}
