import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleHelp, FileText, Flag, Globe, Scale, X } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { BottomSheet } from "../../components/layout/BottomSheet";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { AppButton } from "../../components/design-system/AppButton";
import { useAccountCreateFlowStore } from "../../stores/pageStores";

type YesNo = "yes" | "no" | "";

const taxQuestions = [
  "국내에 주소를 두고 있습니까?",
  "국내에 계속하여 1년 이상 거주하고 있습니까?",
  "최근 2년 동안 국내에 체재한 날이 365일 이상입니까?",
  "국내에 계속하여 1년 이상 거주할 것을 필요로 하는 직업이 있습니까?",
] as const;

export function Step13TaxLiabilityCheck() {
  const navigate = useNavigate();
  const hasForeignTax = useAccountCreateFlowStore((state) => state.hasForeignTax);
  const setHasForeignTax = useAccountCreateFlowStore((state) => state.setHasForeignTax);
  const [taxLiability, setTaxLiability] = useState<"none" | "exists">(
    hasForeignTax ? "exists" : "none"
  );
  const [answers, setAnswers] = useState<YesNo[]>(["", "", "", ""]);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const allAnswered = useMemo(
    () => answers.every((answer) => answer !== ""),
    [answers]
  );
  const canProceed = taxLiability === "none" || allAnswered;

  const setAnswer = (index: number, value: YesNo) => {
    setAnswers((prev) =>
      prev.map((item, idx) => (idx === index ? value : item))
    );
  };

  return (
    <>
      <MobileLayout
        title="고객정보등록"
        backPath="/account/step-12"
        bottomContent={
          <Btn_1Col
            disabled={!canProceed}
            onClick={() => {
              setHasForeignTax(taxLiability === "exists");
              navigate("/account/step-14");
            }}
          >
            다음
          </Btn_1Col>
        }
      >
        <div className="space-y-7 pb-2">
          <section className="space-y-2">
            <h2 className="text-2xl leading-tight font-semibold text-foreground">
              해외에 납세의무가 있나요?
            </h2>
            <AppButton
              variant="unstyled"
              onClick={() => setIsGuideOpen(true)}
              className="p-0 text-sm text-muted-foreground underline"
            >
              납세의무는 어떻게 판단하나요?
            </AppButton>
          </section>

          <section className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <AppButton
                type="button"
                variant="unstyled"
                onClick={() => {
                  setTaxLiability("none");
                  setHasForeignTax(false);
                }}
                className={`rounded-xl border py-3 transition-colors ${
                  taxLiability === "none"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground"
                }`}
              >
                없음
              </AppButton>
              <AppButton
                type="button"
                variant="unstyled"
                onClick={() => {
                  setTaxLiability("exists");
                  setHasForeignTax(true);
                }}
                className={`rounded-xl border py-3 transition-colors ${
                  taxLiability === "exists"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground"
                }`}
              >
                있음
              </AppButton>
            </div>

            {taxLiability === "exists" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  해외에 납세의무가 있는지 아래 항목을 확인해주세요.
                </p>
                <div className="rounded-xl border border-border bg-background divide-y divide-border">
                  {taxQuestions.map((question, index) => (
                    <div key={question} className="px-4 py-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold leading-none">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-relaxed text-foreground">
                          {question}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pl-7">
                        <AppButton
                          type="button"
                          variant="unstyled"
                          onClick={() => setAnswer(index, "yes")}
                          className={`rounded-lg border py-2 text-sm transition-colors ${
                            answers[index] === "yes"
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-foreground"
                          }`}
                        >
                          예
                        </AppButton>
                        <AppButton
                          type="button"
                          variant="unstyled"
                          onClick={() => setAnswer(index, "no")}
                          className={`rounded-lg border py-2 text-sm transition-colors ${
                            answers[index] === "no"
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-foreground"
                          }`}
                        >
                          아니오
                        </AppButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </MobileLayout>

      <BottomSheet
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        title=""
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-foreground">
              납세의무 판단 기준 안내
            </p>
            <AppButton
              variant="unstyled"
              onClick={() => setIsGuideOpen(false)}
              className="p-1 text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </AppButton>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
              <Scale className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  납세의무 판단기준 설명
                </p>
                <p className="text-sm text-muted-foreground">
                  해외에 납세의무가 있는지 여부는 고객님의 해외 국가/미국 포함
                  거주 사실과 활동 기준에 따라 판단됩니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
              <Flag className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  미국 납세의무 보유자 기준 안내
                </p>
                <p className="text-sm text-muted-foreground">
                  미국 시민권자, 영주권자(Green Card 보유자), 미국 세법상
                  거주자에 해당할 수 있습니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
              <Globe className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  외국인 해외납세의무 안내
                </p>
                <p className="text-sm text-muted-foreground">
                  대한민국 외 다른 국가에 납세의무가 있는 경우 `있음`을 선택해
                  주세요.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
              <FileText className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  외국인등록증 등 필요 서류 안내
                </p>
                <p className="text-sm text-muted-foreground">
                  해외 납세의무 관련 확인을 위해 추가 서류를 제출할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CircleHelp className="w-4 h-4" />
            <p>상세 기준은 금융사 내부 심사 기준 및 관련 법령을 따릅니다.</p>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
