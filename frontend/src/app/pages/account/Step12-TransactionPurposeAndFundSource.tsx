import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { AppButton } from "../../components/design-system/AppButton";
import { useAccountCreateFlowStore } from "../../stores/pageStores";
import { useTranslation } from "../../i18n";

const transactionPurposeOptions = [
  { value: "SAVING_AND_INVESTMENT", labelKey: "account.transactionInfo.savingInvestment" },
  { value: "SALARY_AND_LIVING_EXPENSES", labelKey: "account.transactionInfo.salaryLiving" },
  { value: "BUSINESS_TRANSACTION", labelKey: "account.transactionInfo.business" },
  { value: "INHERITANCE_OR_GIFT", labelKey: "account.transactionInfo.inheritanceGift" },
] as const;

const fundSourceOptions = [
  { value: "EARNED_AND_PENSION_INCOME", labelKey: "account.transactionInfo.earnedPension" },
  { value: "BUSINESS_INCOME", labelKey: "account.transactionInfo.businessIncome" },
  { value: "FINANCIAL_INCOME", labelKey: "account.transactionInfo.financialIncome" },
  { value: "OTHER", labelKey: "account.transactionInfo.other" },
] as const;

export function Step12TransactionPurposeAndFundSource() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isOwner = useAccountCreateFlowStore((state) => state.isOwner);
  const purpose = useAccountCreateFlowStore((state) => state.transactionPurpose);
  const fundSource = useAccountCreateFlowStore((state) => state.fundSource);
  const setTransactionInfo = useAccountCreateFlowStore((state) => state.setTransactionInfo);
  const [isPurposeOpen, setIsPurposeOpen] = useState(false);
  const [isFundSourceOpen, setIsFundSourceOpen] = useState(false);
  const selectedPurposeLabelKey = transactionPurposeOptions.find((option) => option.value === purpose)?.labelKey;
  const selectedFundSourceLabelKey = fundSourceOptions.find((option) => option.value === fundSource)?.labelKey;

  const canSubmit = useMemo(
    () => isOwner && Boolean(purpose) && Boolean(fundSource),
    [isOwner, purpose, fundSource]
  );

  return (
    <MobileLayout
      title={t("account.transactionInfoTitle", "거래목적 및 자금출처")}
      titleKey="account.transactionInfoTitle"
      backPath="/account/step-11"
      bottomContent={
        <Btn_1Col
          disabled={!canSubmit}
          onClick={() => navigate("/account/step-13")}
        >
          {t("account.next", "다음")}
        </Btn_1Col>
      }
    >
      <div className="space-y-8 pb-2">
        <section className="space-y-2">
          <h2 className="text-2xl leading-tight font-semibold text-foreground">
            {t("account.transactionInfo.heading", "금융거래 목적과\n자금출처를 선택해 주세요")
              .split("\n")
              .map((line, index, lines) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < lines.length - 1 && <br />}
                </span>
              ))}
          </h2>
        </section>

        <section className="space-y-4">
          <p className="text-foreground">
            {t("account.transactionInfo.ownerQuestion", "거래자금은 본인 소유인가요?")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <AppButton
              type="button"
              variant="unstyled"
              onClick={() => setTransactionInfo(true, purpose, fundSource)}
              className={`rounded-xl border py-3 transition-colors ${
                isOwner
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground"
              }`}
            >
              {t("account.transactionInfo.yes", "예")}
            </AppButton>
            <AppButton
              type="button"
              variant="unstyled"
              onClick={() => setTransactionInfo(false, purpose, fundSource)}
              className={`rounded-xl border py-3 transition-colors ${
                !isOwner
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground"
              }`}
            >
              {t("account.transactionInfo.no", "아니요")}
            </AppButton>
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <label className="block text-foreground">
              {t("account.transactionInfo.purposeLabel", "거래목적 선택")}
            </label>
            <AppButton
              variant="unstyled"
              onClick={() => {
                setIsPurposeOpen((prev) => !prev);
                setIsFundSourceOpen(false);
              }}
              className="w-full rounded-xl border border-border bg-background px-4 py-4 flex items-center justify-between text-left"
            >
              <span className={purpose ? "text-foreground" : "text-muted-foreground"}>
                {selectedPurposeLabelKey
                  ? t(selectedPurposeLabelKey)
                  : t("account.transactionInfo.placeholder", "선택해 주세요")}
              </span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </AppButton>
            {isPurposeOpen && (
              <div className="rounded-xl border border-border bg-background overflow-hidden">
                {transactionPurposeOptions.map((option) => (
                  <AppButton
                    key={option.value}
                    variant="unstyled"
                    onClick={() => {
                      setTransactionInfo(isOwner, option.value, fundSource);
                      setIsPurposeOpen(false);
                    }}
                    className={`w-full px-4 py-4 flex items-center justify-between text-left border-b border-border last:border-b-0 ${
                      purpose === option.value ? "bg-secondary" : ""
                    }`}
                  >
                    <span>{t(option.labelKey)}</span>
                    {purpose === option.value && <Check className="w-4 h-4 text-primary" />}
                  </AppButton>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-foreground">
              {t("account.transactionInfo.fundSourceLabel", "자금출처 선택")}
            </label>
            <AppButton
              variant="unstyled"
              onClick={() => {
                setIsFundSourceOpen((prev) => !prev);
                setIsPurposeOpen(false);
              }}
              className="w-full rounded-xl border border-border bg-background px-4 py-4 flex items-center justify-between text-left"
            >
              <span className={fundSource ? "text-foreground" : "text-muted-foreground"}>
                {selectedFundSourceLabelKey
                  ? t(selectedFundSourceLabelKey)
                  : t("account.transactionInfo.placeholder", "선택해 주세요")}
              </span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </AppButton>
            {isFundSourceOpen && (
              <div className="rounded-xl border border-border bg-background overflow-hidden">
                {fundSourceOptions.map((option) => (
                  <AppButton
                    key={option.value}
                    variant="unstyled"
                    onClick={() => {
                      setTransactionInfo(isOwner, purpose, option.value);
                      setIsFundSourceOpen(false);
                    }}
                    className={`w-full px-4 py-4 flex items-center justify-between text-left border-b border-border last:border-b-0 ${
                      fundSource === option.value ? "bg-secondary" : ""
                    }`}
                  >
                    <span>{t(option.labelKey)}</span>
                    {fundSource === option.value && <Check className="w-4 h-4 text-primary" />}
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
