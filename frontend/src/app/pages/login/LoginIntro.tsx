import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { useTranslation } from '../../i18n'
import { isOnboardingCompleted } from '../../utils/onboardingStorage'
import loginIllustration from './assets/login-illustration.png'
import loginIllustrationWebp from './assets/login-illustration.webp'

export function LoginIntro() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const locationState = location.state as { fromLanguage?: boolean } | null
  const backPath = locationState?.fromLanguage ? '/language' : '/main'

  if (!locationState?.fromLanguage && !isOnboardingCompleted()) {
    return <Navigate to="/language" replace />;
  }

  const handleLogin = () => {
    navigate("/login/form", {
      state: { backPath: "/login", redirectTo: "/main" },
    });
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <MobileLayout
      title={t('login.title')}
      titleKey="login.title"
      headerType="back"
      backPath={backPath}
      bottomContent={
        <div className="space-y-3">
          <Btn_1Col onClick={handleSignup}>{t('login.signup')}</Btn_1Col>
          <Btn_1Col variant="outline" onClick={handleLogin}>
            {t('login.login')}
          </Btn_1Col>
        </div>
      }
    >
      <section className="flex min-h-full flex-col pt-2">
        <section className="space-y-3">
          <h2 className="whitespace-pre-line text-2xl font-semibold leading-tight">
            {t('login.introHeading')}
          </h2>
        </section>

        <div className="mt-14 flex flex-1 items-center justify-center overflow-hidden">
          <picture>
            <source srcSet={loginIllustrationWebp} type="image/webp" />
            <img
              src={loginIllustration}
              alt={t('login.illustrationAlt')}
              className="h-[360px] w-[calc(100%+48px)] max-w-none object-contain"
            />
          </picture>
        </div>
      </section>
    </MobileLayout>
  );
}
