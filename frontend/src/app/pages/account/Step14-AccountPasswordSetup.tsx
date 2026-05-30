import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleAlert, Lock, Shield, Wallet } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { PinInputBottomSheet } from "../../components/design-system/PinInputBottomSheet";

export function Step14AccountPasswordSetup() {
  const navigate = useNavigate();
  const [isPinSheetOpen, setIsPinSheetOpen] = useState(false);
  const [pinSetupStep, setPinSetupStep] = useState<"first" | "confirm">(
    "first"
  );
  const [firstPin, setFirstPin] = useState("");
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [pinError, setPinError] = useState("");
  const [pinSheetKey, setPinSheetKey] = useState(0);

  const handlePinComplete = (pin: string) => {
    if (pinSetupStep === "first") {
      setFirstPin(pin);
      setPinSetupStep("confirm");
      setPinError("");
      setPinSheetKey((prev) => prev + 1);
      return;
    }

    if (pin === firstPin) {
      setIsPinVerified(true);
      setPinError("");
      setIsPinSheetOpen(false);
      return;
    }

    setPinError("비밀번호가 일치하지 않습니다. 다시 입력해 주세요.");
    setIsPinVerified(false);
    setFirstPin("");
    setPinSetupStep("first");
    setPinSheetKey((prev) => prev + 1);
  };

  const handlePrimaryAction = () => {
    if (!isPinVerified) {
      setPinError("");
      setPinSetupStep("first");
      setFirstPin("");
      setPinSheetKey((prev) => prev + 1);
      setIsPinSheetOpen(true);
      return;
    }

    navigate("/account/step-15");
  };

  const handlePinSheetClose = () => {
    setIsPinSheetOpen(false);
    if (!isPinVerified) {
      setPinSetupStep("first");
      setFirstPin("");
      setPinSheetKey((prev) => prev + 1);
    }
  };

  return (
    <>
      <MobileLayout
        title="입출금계좌 개설"
        backPath="/account/step-13"
        bottomContent={
          <Btn_1Col onClick={handlePrimaryAction}>
            {isPinVerified ? "다음" : "비밀번호 등록하기"}
          </Btn_1Col>
        }
      >
        <div className="space-y-8 pb-2">
          <section className="space-y-2 text-center pt-6">
            <h2 className="text-2xl leading-tight font-semibold text-foreground">
              계좌 비밀번호를
              <br />
              등록해 주세요
            </h2>
          </section>

          <section className="flex justify-center">
            <div className="h-36 w-36 rounded-full bg-secondary flex items-center justify-center">
              <div className="h-20 w-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
                <Lock className="w-10 h-10" />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <p className="text-sm text-foreground">
                금융사기 피해예방을 위해
                <br />
                한도제한계좌로 개설됩니다
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3">
              <Wallet className="w-5 h-5 text-primary mt-0.5" />
              <p className="text-sm text-foreground">
                1일 이체한도 30만원으로
                <br />
                자동 설정됩니다
              </p>
            </div>
          </section>

          {pinError && (
            <p className="text-sm text-destructive text-center">{pinError}</p>
          )}
        </div>
      </MobileLayout>

      <PinInputBottomSheet
        key={pinSheetKey}
        isOpen={isPinSheetOpen}
        onClose={handlePinSheetClose}
        title={
          pinSetupStep === "first"
            ? "사용하실 비밀번호를 입력해 주세요"
            : "비밀번호를 한 번 더 입력해 주세요"
        }
        pinLength={4}
        onComplete={handlePinComplete}
      />
    </>
  );
}
