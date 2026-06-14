import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleHelp, FileText, Flag, Globe, Scale, X } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { BottomSheet } from "../../components/layout/BottomSheet";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { AppButton } from "../../components/design-system/AppButton";
import { useAccountCreateFlowStore } from "../../stores/pageStores";
import { useTranslation } from "../../i18n";

type YesNo = "yes" | "no" | "";

const taxQuestionKeys = [
  "account.tax.question1",
  "account.tax.question2",
  "account.tax.question3",
  "account.tax.question4",
] as const;

const guideItems = [
  {
    icon: Scale,
    titleKey: "account.tax.guideCriteriaTitle",
    descriptionKey: "account.tax.guideCriteriaDescription",
  },
  {
    icon: Flag,
    titleKey: "account.tax.guideUsTitle",
    descriptionKey: "account.tax.guideUsDescription",
  },
  {
    icon: Globe,
    titleKey: "account.tax.guideOtherTitle",
    descriptionKey: "account.tax.guideOtherDescription",
  },
  {
    icon: FileText,
    titleKey: "account.tax.guideDocumentTitle",
    descriptionKey: "account.tax.guideDocumentDescription",
  },
] as const;

export function Step13TaxLiabilityCheck() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        title={t("account.customerInfoTitle")}
        titleKey="account.customerInfoTitle"
        backPath="/account/step-12"
        bottomContent={
          <Btn_1Col
            disabled={!canProceed}
            onClick={() => {
              setHasForeignTax(taxLiability === "exists");
              navigate("/account/step-14");
            }}
          >
            {t("account.next")}
          </Btn_1Col>
        }
      >
        <div className="space-y-7 pb-2">
          <section className="space-y-2">
            <h2 className="text-2xl leading-tight font-semibold text-foreground">
              {t("account.tax.heading")}
            </h2>
            <AppButton
              variant="unstyled"
              onClick={() => setIsGuideOpen(true)}
              className="p-0 text-sm text-muted-foreground underline"
            >
              {t("account.tax.guideLink")}
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
                {t("account.tax.none")}
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
                {t("account.tax.exists")}
              </AppButton>
            </div>

            {taxLiability === "exists" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("account.tax.description")}
                </p>
                <div className="rounded-xl border border-border bg-background divide-y divide-border">
                  {taxQuestionKeys.map((questionKey, index) => (
                    <div key={questionKey} className="px-4 py-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold leading-none">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-relaxed text-foreground">
                          {t(questionKey)}
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
                          {t("account.transactionInfo.yes")}
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
                          {t("account.transactionInfo.no")}
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
              {t("account.tax.guideTitle")}
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
            {guideItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.titleKey} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
                  <Icon className="w-5 h-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{t(item.titleKey)}</p>
                    <p className="text-sm text-muted-foreground">{t(item.descriptionKey)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CircleHelp className="w-4 h-4" />
            <p>{t("account.tax.guideFootnote")}</p>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
