import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { AppButton } from "../../components/design-system/AppButton";
import { useTransferSendPageStore } from "../../stores/pageStores";

type TransferEntryType = "해외송금" | "해외송금관리";

const ENTRY_BUTTON_LABELS: Record<TransferEntryType, string> = {
  해외송금: "해외송금 보내기",
  해외송금관리: "송금내역 조회",
};

interface TransferEntryCardProps {
  title: TransferEntryType;
  description: string;
  onClick: () => void;
}

function TransferEntryCard({
  title,
  description,
  onClick,
}: TransferEntryCardProps) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="text-xs leading-5 text-muted-foreground whitespace-pre-line">
          {description}
        </p>
      </div>

      <AppButton
        variant="unstyled"
        onClick={onClick}
        className="flex w-full items-center justify-between rounded-2xl border border-border bg-background px-5 py-5 text-left transition-colors hover:bg-secondary/40"
      >
        <span className="text-sm font-semibold text-foreground">
          {ENTRY_BUTTON_LABELS[title]}
        </span>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </AppButton>
    </section>
  );
}

export function TransferHome() {
  const navigate = useNavigate();
  const isInitialVerificationComplete = useTransferSendPageStore(
    (state) => state.isInitialVerificationComplete
  );

  const handleSendEntry = () => {
    navigate(
      isInitialVerificationComplete
        ? "/global-transfer/send/step-01"
        : "/global-transfer/send/verification"
    );
  };

  return (
    <MobileLayout title="해외송금" headerType="back" backPath="/main">
      <div className="space-y-8 pt-3">
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">해외송금</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            송금과 내역 조회를 한 곳에서 바로 시작할 수 있습니다.
          </p>
        </section>

        <div className="space-y-7">
          <TransferEntryCard
            title="해외송금"
            description="해외 송금을 위한 수취인 정보와 금액을 입력합니다."
            onClick={handleSendEntry}
          />

          <TransferEntryCard
            title="해외송금관리"
            description="송금 진행 상태와 완료 내역을 확인할 수 있습니다."
            onClick={() => navigate("/global-transfer/history")}
          />
        </div>
      </div>
    </MobileLayout>
  );
}
