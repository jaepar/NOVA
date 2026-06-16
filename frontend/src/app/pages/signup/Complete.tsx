import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { useTranslation } from "../../i18n";
import { useSignupPageStore } from "../../stores/pageStores";
import { completeOnboarding } from "../../utils/onboardingStorage";
import { SignupContent } from "./components/SignupContent";

export function Complete() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const resetSignup = useSignupPageStore((state) => state.resetSignup);
  const resetPassword = useSignupPageStore((state) => state.resetPassword);

  const handleComplete = () => {
    resetSignup();
    completeOnboarding();
    navigate("/main");
  };

  const handleBack = () => {
    resetPassword();
    navigate("/signup/password");
  };

  return (
    <MobileLayout
      title={t('signup.title')}
      onBack={handleBack}
      bottomContent={<Btn_1Col onClick={handleComplete}>{t('signup.complete')}</Btn_1Col>}
    >
      <SignupContent className="flex min-h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-7 text-center">
          <div className="flex h-[104px] w-[104px] items-center justify-center rounded-full bg-[#EAF3FF]">
            <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[#DCEBFF]">
              <Check className="h-14 w-14 stroke-[4.5] text-[#1D6FE8]" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">{t('signup.completeHeading')}</h2>
          </div>
        </div>
      </SignupContent>
    </MobileLayout>
  );
}
