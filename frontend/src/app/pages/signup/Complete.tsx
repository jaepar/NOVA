import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { useSignupPageStore } from "../../stores/pageStores";
import { SignupContent } from "./components/SignupContent";

export function Complete() {
  const navigate = useNavigate();
  const resetSignup = useSignupPageStore((state) => state.resetSignup);

  const handleComplete = () => {
    resetSignup();
    navigate("/main");
  };

  return (
    <MobileLayout title="회원가입" bottomContent={<Btn_1Col onClick={handleComplete}>완료</Btn_1Col>}>
      <SignupContent className="flex min-h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-7 text-center">
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-primary/10">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-12 w-12" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">가입이 완료되었어요!</h2>
            
          </div>
        </div>
      </SignupContent>
    </MobileLayout>
  );
}
