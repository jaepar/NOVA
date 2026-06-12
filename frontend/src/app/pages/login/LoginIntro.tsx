import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { isOnboardingCompleted } from "../../utils/onboardingStorage";
import loginIllustration from "./assets/login-illustration.png";

export function LoginIntro() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { fromLanguage?: boolean } | null;
  const backPath = locationState?.fromLanguage ? "/language" : "/main";

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
      title="시작하기"
      headerType="back"
      backPath={backPath}
      bottomContent={
        <div className="space-y-3">
          <Btn_1Col onClick={handleSignup}>회원가입</Btn_1Col>
          <Btn_1Col variant="outline" onClick={handleLogin}>
            로그인하기
          </Btn_1Col>
        </div>
      }
    >
      <section className="flex min-h-full flex-col pt-2">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold leading-tight">
            반가워요!
            <br />
            회원가입/로그인을 진행해주세요
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
  );
}
