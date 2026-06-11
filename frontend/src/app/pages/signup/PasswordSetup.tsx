import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { resetConsentStorage } from "../../domains/storage";
import { useTranslation } from "../../i18n";
import { useSignupPageStore } from "../../stores/pageStores";
import { PasswordInputGroup } from "./components/PasswordInputGroup";
import { SignupContent } from "./components/SignupContent";
import { authApi } from "../../../api";

function toSignupGender(gender: "male" | "female" | "") {
  if (gender === "male") {
    return "MALE";
  }

  if (gender === "female") {
    return "FEMALE";
  }

  return null;
}

function toSignupBirth(birthDate: string) {
  return birthDate.length === 8 ? birthDate.slice(2) : birthDate;
}

export function PasswordSetup() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const email = useSignupPageStore((state) => state.email);
  const name = useSignupPageStore((state) => state.name);
  const birthDate = useSignupPageStore((state) => state.birthDate);
  const gender = useSignupPageStore((state) => state.gender);
  const password = useSignupPageStore((state) => state.password);
  const passwordConfirm = useSignupPageStore((state) => state.passwordConfirm);
  const setPassword = useSignupPageStore((state) => state.setPassword);
  const setPasswordConfirm = useSignupPageStore(
    (state) => state.setPasswordConfirm
  );
  const resetPassword = useSignupPageStore((state) => state.resetPassword);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isPasswordValid = useMemo(
    () => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,16}$/.test(password),
    [password]
  );
  const hasMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm;
  const canContinue =
    isPasswordValid && password === passwordConfirm && !isSubmitting;

  const handleSignup = async () => {
    if (!canContinue) {
      return;
    }

    const signupGender = toSignupGender(gender);

    if (!signupGender) {
      setErrorMessage(t('signup.genderRequired'));
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      await authApi.signup({
        email,
        password,
        passwordConfirm,
        name,
        birth: toSignupBirth(birthDate),
        gender: signupGender,
      });

      navigate("/signup/complete");
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      const message = apiError?.response?.data?.message;
      setErrorMessage(message || t('signup.signupFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    resetConsentStorage();
    resetPassword();
    navigate("/signup/terms");
  };

  return (
    <MobileLayout
      title={t('signup.title')}
      onBack={handleBack}
      bottomContent={
        <Btn_1Col onClick={handleSignup} disabled={!canContinue}>
          {isSubmitting ? t('login.submitting') : t('signup.next')}
        </Btn_1Col>
      }
    >
      <SignupContent className="space-y-10">
        <section>
          <h2 className="text-2xl font-semibold leading-tight">
            {t('signup.passwordHeading')}
          </h2>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <PasswordInputGroup
              label={t('login.password')}
              placeholder={t('login.passwordPlaceholder')}
              value={password}
              onChange={setPassword}
              visible={isPasswordVisible}
              onToggleVisible={() => setPasswordVisible((value) => !value)}
            />
            <p className="text-sm text-muted-foreground">
              {t('signup.passwordFormatHint')}
            </p>
          </div>

          <div className="space-y-2">
            <PasswordInputGroup
              label={t('signup.passwordConfirmLabel')}
              placeholder={t('signup.passwordConfirmPlaceholder')}
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              visible={isConfirmVisible}
              onToggleVisible={() => setConfirmVisible((value) => !value)}
            />
            {hasMismatch && (
              <p className="text-sm text-red-500">
                {t('signup.passwordMismatch')}
              </p>
            )}
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
          </div>
        </section>
      </SignupContent>
    </MobileLayout>
  );
}
