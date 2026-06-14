import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { AppButton } from "../../components/design-system/AppButton";
import { useTransferSendPageStore } from "../../stores/pageStores";
import { useTranslation } from "../../i18n";

type TransferEntryType = "send" | "manage";

interface TransferEntryCardProps {
  type: TransferEntryType;
  onClick: () => void;
}

function TransferEntryCard({ type, onClick }: TransferEntryCardProps) {
  const { t } = useTranslation();
  const titleKey =
    type === "send" ? "globalTransfer.home.sendTitle" : "globalTransfer.home.manageTitle";
  const descriptionKey =
    type === "send"
      ? "globalTransfer.home.sendDescription"
      : "globalTransfer.home.manageDescription";
  const buttonKey =
    type === "send" ? "globalTransfer.home.sendButton" : "globalTransfer.home.manageButton";

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">{t(titleKey)}</h2>
        <p className="whitespace-pre-line text-xs leading-5 text-muted-foreground">
          {t(descriptionKey)}
        </p>
      </div>

      <AppButton
        variant="unstyled"
        onClick={onClick}
        className="flex w-full items-center justify-between rounded-2xl border border-border bg-background px-5 py-5 text-left transition-colors hover:bg-secondary/40"
      >
        <span className="text-sm font-semibold text-foreground">{t(buttonKey)}</span>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </AppButton>
    </section>
  );
}

export function TransferHome() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    <MobileLayout title={t("globalTransfer.title")} headerType="back" backPath="/main">
      <div className="space-y-8 pt-3">
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            {t("globalTransfer.home.title")}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            {t("globalTransfer.home.description")}
          </p>
        </section>

        <div className="space-y-7">
          <TransferEntryCard type="send" onClick={handleSendEntry} />
          <TransferEntryCard type="manage" onClick={() => navigate("/global-transfer/history")} />
        </div>
      </div>
    </MobileLayout>
  );
}
