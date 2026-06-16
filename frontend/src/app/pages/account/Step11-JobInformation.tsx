import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";
import { AccountMobileLayout } from "./components/AccountMobileLayout";
import { BottomSheet } from "../../components/layout/BottomSheet";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { AppButton } from "../../components/design-system/AppButton";
import { useAccountCreateFlowStore } from "../../stores/pageStores";
import { useTranslation } from "../../i18n";

const jobOptions = [
  { value: "EMPLOYED", labelKey: "account.jobInfo.employed" },
  { value: "SELF_EMPLOYED", labelKey: "account.jobInfo.selfEmployed" },
  { value: "FULL_TIME_INVESTOR", labelKey: "account.jobInfo.investor" },
  { value: "PENSIONER", labelKey: "account.jobInfo.pensioner" },
  { value: "HOMEMAKER", labelKey: "account.jobInfo.homemaker" },
  { value: "STUDENT", labelKey: "account.jobInfo.student" },
  { value: "UNEMPLOYED", labelKey: "account.jobInfo.unemployed" },
] as const;

export function Step11JobInformation() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const selectedJob = useAccountCreateFlowStore((state) => state.job);
  const setJob = useAccountCreateFlowStore((state) => state.setJob);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const canSubmit = useMemo(() => selectedJob.length > 0, [selectedJob]);
  const selectedJobLabelKey = jobOptions.find((job) => job.value === selectedJob)?.labelKey;

  const handleSelectJob = (job: string) => {
    setJob(job);
    setIsSheetOpen(false);
  };

  return (
    <>
      <AccountMobileLayout
        title={t("account.jobInfoTitle")}
        titleKey="account.jobInfoTitle"
        backPath="/account/step-10"
        bottomContent={
          <Btn_1Col
            disabled={!canSubmit}
            onClick={() => navigate("/account/step-12")}
          >
            {t("account.next")}
          </Btn_1Col>
        }
      >
        <div className="space-y-8 pb-2">
          <section className="space-y-2">
            <h2 className="text-2xl leading-tight font-semibold text-foreground">
              {t("account.jobInfo.heading")
                .split("\n")
                .map((line, index, lines) => (
                  <span key={`${line}-${index}`}>
                    {line}
                    {index < lines.length - 1 && <br />}
                  </span>
                ))}
            </h2>
          </section>

          <section className="space-y-2">
            <label className="block text-foreground">{t("account.jobInfo.label")}</label>
            <AppButton
              variant="unstyled"
              onClick={() => setIsSheetOpen(true)}
              className="w-full rounded-xl border border-border bg-background px-4 py-4 flex items-center justify-between text-left"
            >
              <span className={selectedJob ? "text-foreground" : "text-muted-foreground"}>
                {selectedJobLabelKey
                  ? t(selectedJobLabelKey)
                  : t("account.jobInfo.placeholder")}
              </span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </AppButton>
          </section>
        </div>
      </AccountMobileLayout>

      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title=""
        disableScroll
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-2">
            <p className="text-lg font-semibold text-foreground">
              {t("account.jobInfo.sheetTitle")}
            </p>
            <AppButton
              variant="unstyled"
              onClick={() => setIsSheetOpen(false)}
              className="p-1 text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </AppButton>
          </div>
          <div className="divide-y divide-border rounded-xl border border-border bg-background">
            {jobOptions.map((job) => (
              <AppButton
                key={job.value}
                variant="unstyled"
                onClick={() => handleSelectJob(job.value)}
                className="w-full px-4 py-4 text-left text-foreground hover:bg-secondary transition-colors"
              >
                {t(job.labelKey)}
              </AppButton>
            ))}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
