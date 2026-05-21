import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";

const completedItems = [
  "서류 제출",
  "OCR 인증",
  "NFC 인증",
  "얼굴 인증",
] as const;

export function VerificationCompleted() {
  const navigate = useNavigate();

  return (
    <MobileLayout
      title="비대면 실명확인"
      backPath="/certificate/step-10"
      bottomContent={<Btn_1Col onClick={() => navigate("/certificate/step-13")}>최종 제출하기</Btn_1Col>}
    >
      <div className="space-y-8 pb-2">
        <section className="pt-8">
          <h2 className="text-2xl leading-tight font-semibold text-center">
            모든 인증 절차가
            <br />
            완료되었어요
          </h2>
        </section>

        <section className="rounded-3xl border border-border bg-background p-4">
          <div className="divide-y divide-border">
            {completedItems.map((item) => (
              <div key={item} className="flex items-center justify-between py-4 first:pt-2 last:pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Check className="w-5 h-5" />
                  </div>
                  <p>{item}</p>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-blue-50 text-primary text-sm font-medium">
                  완료
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}
