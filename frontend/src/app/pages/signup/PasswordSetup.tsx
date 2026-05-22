import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { useSignupPageStore } from "../../stores/pageStores";
import { PasswordInputGroup } from "./components/PasswordInputGroup";
import { SignupContent } from "./components/SignupContent";
import { authApi } from "../../../api";

function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response;
    const message = response?.data?.message;

    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return fallbackMessage;
}

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
  const email = useSignupPageStore((state) => state.email);
  const name = useSignupPageStore((state) => state.name);
  const birthDate = useSignupPageStore((state) => state.birthDate);
  const gender = useSignupPageStore((state) => state.gender);
  const password = useSignupPageStore((state) => state.password);
  const passwordConfirm = useSignupPageStore((state) => state.passwordConfirm);
  const setPassword = useSignupPageStore((state) => state.setPassword);
  const setPasswordConfirm = useSignupPageStore((state) => state.setPasswordConfirm);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isPasswordValid = useMemo(
    () => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,16}$/.test(password),
    [password],
  );
  const hasMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;
  const canContinue = isPasswordValid && password === passwordConfirm && !isSubmitting;

  const handleSignup = async () => {
    if (!canContinue) {
      return;
    }

    const signupGender = toSignupGender(gender);

    if (!signupGender) {
      setErrorMessage("성별을 다시 선택해주세요.");
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
      setErrorMessage(getApiErrorMessage(error, "회원가입을 완료할 수 없습니다. 다시 시도해주세요."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MobileLayout
      title="회원가입"
      bottomContent={
        <Btn_1Col onClick={handleSignup} disabled={!canContinue}>
          {isSubmitting ? "처리 중" : "다음으로"}
        </Btn_1Col>
      }
    >
      <SignupContent className="space-y-10">
        <section>
          <h2 className="text-2xl font-semibold leading-tight">비밀번호를 입력해주세요</h2>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <PasswordInputGroup
              label="비밀번호"
              placeholder="비밀번호 입력"
              value={password}
              onChange={setPassword}
              visible={isPasswordVisible}
              onToggleVisible={() => setPasswordVisible((value) => !value)}
            />
            <p className="text-sm text-muted-foreground">영문, 숫자, 특수문자 조합 8~16자리</p>
          </div>

          <div className="space-y-2">
            <PasswordInputGroup
              label="비밀번호 확인"
              placeholder="비밀번호 확인"
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              visible={isConfirmVisible}
              onToggleVisible={() => setConfirmVisible((value) => !value)}
            />
            {hasMismatch && <p className="text-sm text-red-500">비밀번호가 일치하지 않습니다.</p>}
            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
          </div>
        </section>
      </SignupContent>
    </MobileLayout>
  );
}
