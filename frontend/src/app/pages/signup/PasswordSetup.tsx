import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { resetConsentStorage } from "../../domains/certificate-consent/storage";
import { useSignupPageStore } from "../../stores/pageStores";
import { PasswordInputGroup } from "./components/PasswordInputGroup";
import { SignupContent } from "./components/SignupContent";

export function PasswordSetup() {
  const navigate = useNavigate();
  const password = useSignupPageStore((state) => state.password);
  const passwordConfirm = useSignupPageStore((state) => state.passwordConfirm);
  const setPassword = useSignupPageStore((state) => state.setPassword);
  const setPasswordConfirm = useSignupPageStore((state) => state.setPasswordConfirm);
  const resetPassword = useSignupPageStore((state) => state.resetPassword);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const isPasswordValid = useMemo(
    () => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,16}$/.test(password),
    [password],
  );
  const hasMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;
  const canContinue = isPasswordValid && password === passwordConfirm;

  const handleBack = () => {
    resetConsentStorage();
    resetPassword();
    navigate("/signup/terms");
  };

  return (
    <MobileLayout
      title="회원가입"
      onBack={handleBack}
      bottomContent={
        <Btn_1Col onClick={() => navigate("/signup/complete")} disabled={!canContinue}>
          다음으로
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
          </div>
        </section>
      </SignupContent>
    </MobileLayout>
  );
}
