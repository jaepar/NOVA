import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { AppButton } from "../../components/design-system/AppButton";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { CommonInputGroup } from "../../components/design-system/CommonInputGroup";
import { useTranslation } from "../../i18n";
import { useSignupPageStore } from "../../stores/pageStores";
import { BirthDatePicker } from "./components/BirthDatePicker";
import { SignupContent } from "./components/SignupContent";

export function PersonalInfo() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const name = useSignupPageStore((state) => state.name);
  const birthDate = useSignupPageStore((state) => state.birthDate);
  const gender = useSignupPageStore((state) => state.gender);
  const setName = useSignupPageStore((state) => state.setName);
  const setBirthDate = useSignupPageStore((state) => state.setBirthDate);
  const setGender = useSignupPageStore((state) => state.setGender);
  const resetEmailVerification = useSignupPageStore(
    (state) => state.resetEmailVerification
  );
  const resetPersonalInfo = useSignupPageStore(
    (state) => state.resetPersonalInfo
  );
  const canContinue =
    name.trim().length > 0 && birthDate.length === 8 && Boolean(gender);

  const handleBack = () => {
    resetEmailVerification();
    resetPersonalInfo();
    navigate("/signup");
  };

  return (
    <MobileLayout
      title={t('signup.title')}
      onBack={handleBack}
      bottomContent={
        <Btn_1Col
          onClick={() => navigate("/signup/terms")}
          disabled={!canContinue}
        >
          {t('signup.next')}
        </Btn_1Col>
      }
    >
      <SignupContent className="space-y-10">
        <section>
          <h2 className="text-2xl font-semibold leading-tight">
            {t('signup.personalInfoHeading')}
          </h2>
        </section>

        <section className="space-y-6">
          <CommonInputGroup
            label={t('signup.name')}
            placeholder={t('signup.namePlaceholder')}
            value={name}
            onChange={setName}
          />

          <BirthDatePicker value={birthDate} onChange={setBirthDate} />

          <div className="space-y-3">
            <label className="block">{t('signup.genderLabel')}</label>
            <div className="grid grid-cols-2 gap-3">
              <AppButton
                type="button"
                variant="unstyled"
                onClick={() => setGender("male")}
                className={`rounded-xl border py-4 text-center transition-colors ${
                  gender === "male"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground"
                }`}
              >
                {t('signup.male')}
              </AppButton>
              <AppButton
                type="button"
                variant="unstyled"
                onClick={() => setGender("female")}
                className={`rounded-xl border py-4 text-center transition-colors ${
                  gender === "female"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground"
                }`}
              >
                {t('signup.female')}
              </AppButton>
            </div>
          </div>
        </section>
      </SignupContent>
    </MobileLayout>
  );
}
