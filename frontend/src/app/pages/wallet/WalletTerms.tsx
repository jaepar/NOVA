import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { walletApi } from "../../../api";
import { AppButton } from "../../components/design-system/AppButton";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { WalletAgreementItem } from "./components/WalletAgreementItem";
import { walletTerms } from "./data/walletTerms";
import { walletPrimaryButtonClass } from "./styles";
import { useWalletStore } from "./stores/walletStore";

export function WalletTerms() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null);
  const checkedTermIds = useWalletStore((state) => state.checkedTermIds);
  const expandedTermId = useWalletStore((state) => state.expandedTermId);
  const agreementsOpen = useWalletStore((state) => state.agreementsOpen);
  const toggleTerm = useWalletStore((state) => state.toggleTerm);
  const toggleAllRequiredTerms = useWalletStore(
    (state) => state.toggleAllRequiredTerms,
  );
  const toggleExpandedTerm = useWalletStore((state) => state.toggleExpandedTerm);
  const setAgreementsOpen = useWalletStore((state) => state.setAgreementsOpen);
  const resetTermsFlow = useWalletStore((state) => state.resetTermsFlow);

  const requiredTermIds = useMemo(
    () => walletTerms.filter((term) => term.required).map((term) => term.id),
    [],
  );

  const allRequiredChecked = requiredTermIds.every((id) =>
    checkedTermIds.includes(id),
  );

  const toggleAllTerms = () => {
    toggleAllRequiredTerms(requiredTermIds);
  };

  const handleAgree = async () => {
    if (!allRequiredChecked || isCreating) return;

    setIsCreating(true);
    setCreateErrorMessage(null);

    try {
      await walletApi.create({ termsAgreed: true });
      resetTermsFlow();
      navigate("/wallet/home", { replace: true });
    } catch {
      setCreateErrorMessage("월렛 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <MobileLayout
      title="월렛"
      bottomContent={
        <div className="space-y-3">
          {createErrorMessage && (
            <div
              role="alert"
              className="rounded-xl bg-[#fff2f2] px-4 py-3 text-center text-[14px] font-medium text-[#d92d20] shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            >
              {createErrorMessage}
            </div>
          )}

          <AppButton
            type="button"
            variant="unstyled"
            disabled={!allRequiredChecked || isCreating}
            onClick={handleAgree}
            className={walletPrimaryButtonClass}
          >
            {isCreating ? "생성 중" : "동의"}
          </AppButton>
        </div>
      }
    >
      <section className="pt-12 pl-3 pr-5">
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
                  ? "border-[#111111] bg-[#111111] text-white"
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
