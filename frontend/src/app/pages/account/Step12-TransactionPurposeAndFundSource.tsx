import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { AppButton } from "../../components/design-system/AppButton";

const transactionPurposeOptions = [
  "저축 및 투자",
  "급여 및 생활비",
  "사업상 거래",
  "상속·증여성 거래 등",
] as const;

const fundSourceOptions = [
  "근로 및 연금소득",
  "사업소득",
  "금융소득",
  "기타",
] as const;

export function Step12TransactionPurposeAndFundSource() {
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState<"yes" | "no">("no");
  const [purpose, setPurpose] = useState("");
  const [fundSource, setFundSource] = useState("");
  const [isPurposeOpen, setIsPurposeOpen] = useState(false);
  const [isFundSourceOpen, setIsFundSourceOpen] = useState(false);

  const canSubmit = useMemo(
    () => isOwner === "yes" && Boolean(purpose) && Boolean(fundSource),
    [isOwner, purpose, fundSource]
  );

  return (
    <MobileLayout
      title="거래목적 및 자금출처"
      backPath="/account/step-11"
      bottomContent={
        <Btn_1Col
          disabled={!canSubmit}
          onClick={() => navigate("/account/step-13")}
        >
          다음
        </Btn_1Col>
      }
    >
      <div className="space-y-8 pb-2">
        <section className="space-y-2">
          <h2 className="text-2xl leading-tight font-semibold text-foreground">
            금융거래 목적과
            <br />
            자금출처를 선택해주세요
          </h2>
        </section>

        <section className="space-y-4">
          <p className="text-foreground">거래자금이 본인 소유인가요?</p>
          <div className="grid grid-cols-2 gap-2">
            <AppButton
              type="button"
              variant="unstyled"
              onClick={() => setIsOwner("yes")}
              className={`rounded-xl border py-3 transition-colors ${
                isOwner === "yes"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground"
              }`}
            >
              예
            </AppButton>
            <AppButton
              type="button"
              variant="unstyled"
              onClick={() => setIsOwner("no")}
              className={`rounded-xl border py-3 transition-colors ${
                isOwner === "no"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground"
              }`}
            >
              아니오
            </AppButton>
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <label className="block text-foreground">거래목적 선택</label>
            <AppButton
              variant="unstyled"
              onClick={() => {
                setIsPurposeOpen((prev) => !prev);
                setIsFundSourceOpen(false);
              }}
              className="w-full rounded-xl border border-border bg-background px-4 py-4 flex items-center justify-between text-left"
            >
              <span className={purpose ? "text-foreground" : "text-muted-foreground"}>
                {purpose || "선택해 주세요"}
              </span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </AppButton>
            {isPurposeOpen && (
              <div className="rounded-xl border border-border bg-background overflow-hidden">
                {transactionPurposeOptions.map((option) => (
                  <AppButton
                    key={option}
                    variant="unstyled"
                    onClick={() => {
                      setPurpose(option);
                      setIsPurposeOpen(false);
                    }}
                    className={`w-full px-4 py-4 flex items-center justify-between text-left border-b border-border last:border-b-0 ${
                      purpose === option ? "bg-secondary" : ""
                    }`}
                  >
                    <span>{option}</span>
                    {purpose === option && <Check className="w-4 h-4 text-primary" />}
                  </AppButton>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-foreground">자금출처 선택</label>
            <AppButton
              variant="unstyled"
              onClick={() => {
                setIsFundSourceOpen((prev) => !prev);
                setIsPurposeOpen(false);
              }}
              className="w-full rounded-xl border border-border bg-background px-4 py-4 flex items-center justify-between text-left"
            >
              <span className={fundSource ? "text-foreground" : "text-muted-foreground"}>
                {fundSource || "선택해 주세요"}
              </span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </AppButton>
            {isFundSourceOpen && (
              <div className="rounded-xl border border-border bg-background overflow-hidden">
                {fundSourceOptions.map((option) => (
                  <AppButton
                    key={option}
                    variant="unstyled"
                    onClick={() => {
                      setFundSource(option);
                      setIsFundSourceOpen(false);
                    }}
                    className={`w-full px-4 py-4 flex items-center justify-between text-left border-b border-border last:border-b-0 ${
                      fundSource === option ? "bg-secondary" : ""
                    }`}
                  >
                    <span>{option}</span>
                    {fundSource === option && <Check className="w-4 h-4 text-primary" />}
                  </AppButton>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}
