import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { AppButton } from "../../components/design-system/AppButton";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { WalletAgreementItem } from "./components/WalletAgreementItem";
import { walletTerms } from "./data/walletTerms";

export function WalletTerms() {
  const navigate = useNavigate();
  const [checkedTermIds, setCheckedTermIds] = useState<string[]>([]);
  const [expandedTermId, setExpandedTermId] = useState("");
  const [agreementsOpen, setAgreementsOpen] = useState(true);

  const requiredTermIds = useMemo(
    () => walletTerms.filter((term) => term.required).map((term) => term.id),
    [],
  );

  const allRequiredChecked = requiredTermIds.every((id) =>
    checkedTermIds.includes(id),
  );

  const toggleTerm = (termId: string) => {
    setCheckedTermIds((current) =>
      current.includes(termId)
        ? current.filter((id) => id !== termId)
        : [...current, termId],
    );
  };

  const toggleAllTerms = () => {
    setCheckedTermIds(allRequiredChecked ? [] : requiredTermIds);
  };

  const toggleExpandedTerm = (termId: string) => {
    setExpandedTermId((current) => (current === termId ? "" : termId));
  };

  const handleAgree = () => {
    if (!allRequiredChecked) return;
    navigate("/wallet/home");
  };

  return (
    <MobileLayout
      title="월렛"
      bottomContent={
        <Btn_1Col onClick={handleAgree}>
          동의
        </Btn_1Col>
      }
    >
      <section className="pt-12">
        <h2 className="text-[28px] font-semibold leading-10 text-foreground">
          약관 동의
        </h2>
        <p className="mt-4 whitespace-nowrap text-[12px] leading-6 text-muted-foreground">
          서비스 이용을 위해 아래 약관에 동의해 주세요.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <div className="rounded-xl border border-border bg-background">
          <div className="flex h-16 items-center gap-3 px-4">
            <AppButton
              type="button"
              variant="unstyled"
              onClick={toggleAllTerms}
              aria-pressed={allRequiredChecked}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                allRequiredChecked
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-gray-300 bg-background text-transparent"
              }`}
            >
              <Check className="h-5 w-5" />
            </AppButton>

            <AppButton
              type="button"
              variant="unstyled"
              onClick={() => setAgreementsOpen((open) => !open)}
              className="flex min-w-0 flex-1 items-center justify-between text-left"
            >
              <span className="text-lg font-semibold leading-7 text-foreground">
                전체 동의
              </span>
              <ChevronDown
                className={`h-5 w-5 text-muted-foreground transition-transform ${
                  agreementsOpen ? "rotate-180" : ""
                }`}
              />
            </AppButton>
          </div>
        </div>

        {agreementsOpen && (
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            {walletTerms.map((term, index) => (
              <WalletAgreementItem
                key={term.id}
                term={term}
                checked={checkedTermIds.includes(term.id)}
                expanded={expandedTermId === term.id}
                showDivider={index < walletTerms.length - 1}
                onToggleCheck={() => toggleTerm(term.id)}
                onToggleExpanded={() => toggleExpandedTerm(term.id)}
              />
            ))}
          </div>
        )}
      </section>
    </MobileLayout>
  );
}
