import { useNavigate } from 'react-router-dom'
import { MobileLayout } from '../components/layout/MobileLayout'
import { Btn_1Col } from '../components/design-system/Btn_1Col'
import loginIllustration from './login/assets/login-illustration.png'

export function Login() {
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/login/form')
  }

  return (
    <MobileLayout
      title="로그인"
      headerType="back"
      backPath="/main"
      bottomContent={<Btn_1Col onClick={handleLogin}>일반 로그인</Btn_1Col>}
    >
      <section className="flex min-h-full flex-col pt-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold leading-tight">
            반가워요!
            <br />
            로그인을 진행해주세요
          </h2>
        </section>

        <div className="mt-14 flex flex-1 items-center justify-center overflow-hidden">
          <img
            src={loginIllustration}
            alt="로그인 안내 일러스트레이션"
            className="h-[360px] w-[calc(100%+48px)] max-w-none object-contain"
          />
        </div>
      </section>
    </MobileLayout>
  )
}
