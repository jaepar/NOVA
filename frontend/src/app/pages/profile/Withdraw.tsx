import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { AppButton } from '../../components/design-system/AppButton'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { CommonInputGroup } from '../../components/design-system/CommonInputGroup'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useMainPageStore } from '../../stores/pageStores'

export function Withdraw() {
  const navigate = useNavigate()
  const logout = useMainPageStore((state) => state.logout)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setPasswordVisible] = useState(false)
  const canWithdraw = email.trim().length > 0 && password.length > 0
  const PasswordIcon = isPasswordVisible ? EyeOff : Eye

  const handleWithdraw = () => {
    if (!canWithdraw) return

    logout()
    navigate('/main')
  }

  return (
    <MobileLayout
      title="회원탈퇴"
      headerType="back"
      backPath="/mypage"
      bottomContent={
        <Btn_1Col disabled={!canWithdraw} onClick={handleWithdraw}>
          회원탈퇴
        </Btn_1Col>
      }
    >
      <section className="flex min-h-full flex-col pt-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold leading-tight">
            회원탈퇴를 진행할게요
          </h2>
        </section>

        <div className="mt-14 space-y-9">
          <CommonInputGroup
            label="이메일"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={setEmail}
          />

          <div className="flex flex-col gap-2">
            <label className="block">비밀번호</label>
            <div className="relative">
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder="비밀번호 입력"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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
        </div>
      </section>
    </MobileLayout>
  )
}
