import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { BottomSheet } from "../../components/layout/BottomSheet";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { AppButton } from "../../components/design-system/AppButton";
import { useAccountCreateFlowStore } from "../../stores/pageStores";

const jobOptions = [
  "기업소득자",
  "자영업자",
  "전업투자자",
  "연금소득자",
  "주부",
  "학생",
  "무직 등",
] as const;

export function Step11JobInformation() {
  const navigate = useNavigate();
  const selectedJob = useAccountCreateFlowStore((state) => state.job);
  const setJob = useAccountCreateFlowStore((state) => state.setJob);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const canSubmit = useMemo(() => selectedJob.length > 0, [selectedJob]);

  const handleSelectJob = (job: string) => {
    setJob(job);
    setIsSheetOpen(false);
  };

  return (
    <>
      <MobileLayout
        title="직장정보입력"
        backPath="/account/step-10"
        bottomContent={
          <Btn_1Col
            disabled={!canSubmit}
            onClick={() => navigate("/account/step-12")}
          >
            다음
          </Btn_1Col>
        }
      >
        <div className="space-y-8 pb-2">
          <section className="space-y-2">
            <h2 className="text-2xl leading-tight font-semibold text-foreground">
              고객님의 직장 정보를
              <br />
              입력해 주세요
            </h2>
          </section>

          <section className="space-y-2">
            <label className="block text-foreground">직업</label>
            <AppButton
              variant="unstyled"
              onClick={() => setIsSheetOpen(true)}
              className="w-full rounded-xl border border-border bg-background px-4 py-4 flex items-center justify-between text-left"
            >
              <span
                className={
                  selectedJob ? "text-foreground" : "text-muted-foreground"
                }
              >
                {selectedJob || "선택해 주세요"}
              </span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </AppButton>
          </section>
        </div>
      </MobileLayout>

      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title=""
        disableScroll
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-2">
            <p className="text-lg font-semibold text-foreground">직업 선택</p>
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
                key={job}
                variant="unstyled"
                onClick={() => handleSelectJob(job)}
                className="w-full px-4 py-4 text-left text-foreground hover:bg-secondary transition-colors"
              >
                {job}
              </AppButton>
            ))}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
