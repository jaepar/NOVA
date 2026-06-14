import type { KeyboardEvent, MouseEvent } from "react";
import { MoreVertical } from "lucide-react";
import { AppButton } from "../../components/design-system/AppButton";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { novaToast } from "../../components/design-system/toast";
import { useTranslation } from "../../i18n";
import type { AccountHomeResponse } from "../../../api";

interface MainAccountPanelProps {
  isLoggedIn: boolean;
  accountHome: AccountHomeResponse | null;
  isLoading: boolean;
  onLoginClick: () => void;
  onOpenCertificateSheet: () => void;
  onOpenAccount: () => void;
  onAccountPanelClick: () => void;
  onTransferClick: () => void;
}

const panelShellClassName =
  "min-h-[180px] rounded-2xl p-6 flex flex-col justify-between";

const neutralPanelClassName = `${panelShellClassName} border border-border bg-background shadow-[0_4px_16px_rgba(15,23,42,0.05)]`;
const secondaryPanelClassName = `${panelShellClassName} bg-secondary`;
const accountPanelClassName =
  "bg-gradient-to-br from-[#003CA6] to-[#2563EB] text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#003CA6]";

export function MainAccountPanel({
  isLoggedIn,
  accountHome,
  isLoading,
  onLoginClick,
  onOpenCertificateSheet,
  onOpenAccount,
  onAccountPanelClick,
  onTransferClick,
}: MainAccountPanelProps) {
  const { t, language } = useTranslation();
  const locale = language === "ko" ? "ko-KR" : "en-US";

  if (isLoggedIn && isLoading) {
    return (
      <div className={secondaryPanelClassName}>
        <div className="space-y-3">
          <div className="h-6 w-32 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-48 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="h-14 w-full rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className={neutralPanelClassName}>
        <div className="space-y-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-base">
              {t("main.loginPanelTitle")}
            </h3>
            <p className="text-sm leading-5 text-muted-foreground">
              {t("main.loginPanelDescription")}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <Btn_1Col onClick={onLoginClick}>{t("login.login")}</Btn_1Col>
        </div>
      </div>
    );
  }

  if (!accountHome || accountHome.uiState === "NEED_CERTIFICATE") {
    return (
      <div className={neutralPanelClassName}>
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">
            {t("main.certificateRequiredTitle")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("main.certificateRequiredDescription")}
          </p>
        </div>
        <Btn_1Col onClick={onOpenCertificateSheet}>
          {t("main.issueCertificate")}
        </Btn_1Col>
      </div>
    );
  }

  if (accountHome.uiState === "CERTIFICATE_ISSUING") {
    return (
      <div className={secondaryPanelClassName}>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-base">
              {t("main.certificateIssuingTitle")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("main.certificateIssuingDescription")}
            </p>
          </div>
          <p className="rounded-lg bg-background/60 px-3 py-2.5 text-center text-sm font-medium text-foreground">
            {t("main.reviewingDocuments")}
          </p>
        </div>
        <div aria-hidden="true" className="h-11" />
      </div>
    );
  }

  if (accountHome.uiState === "READY_TO_OPEN_ACCOUNT") {
    return (
      <div className={secondaryPanelClassName}>
        <div className="space-y-2">
          <h3 className="font-semibold text-base">
            {t("main.readyToOpenTitle")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("main.readyToOpenDescription")}
          </p>
        </div>
        <Btn_1Col onClick={onOpenAccount}>{t("main.openAccount")}</Btn_1Col>
      </div>
    );
  }

  const account = accountHome.account;

  if (!account) {
    return null;
  }

  const handleCopyAccountNumber = async (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    try {
      await navigator.clipboard.writeText(account.accountNumber);
      novaToast.success(t("main.accountNumberCopied"));
    } catch {
      novaToast.error(t("main.accountNumberCopyFailed"));
    }
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onAccountPanelClick();
    }
  };

  const handleTransferClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onTransferClick();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onAccountPanelClick}
      onKeyDown={handlePanelKeyDown}
      className={`${panelShellClassName} ${accountPanelClassName}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{account.accountName}</span>
              {account.hasLimit && (
                <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-medium">
                  {t("main.limitedAccount")}
                </span>
              )}
            </div>

            <AppButton
              variant="unstyled"
              onClick={handleCopyAccountNumber}
              className="mt-0.5 text-xs text-white/80 hover:text-white"
            >
              {account.bankName} {account.accountNumber}
            </AppButton>
          </div>
        </div>

        <AppButton
          variant="unstyled"
          onClick={(event) => event.stopPropagation()}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </AppButton>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-white/80">{t("main.balance")}</p>
        <div className="flex items-end justify-between gap-3">
          <p className="text-2xl font-semibold">
            {account.balance.toLocaleString(locale)} {t("main.currencyUnit")}
          </p>
          <AppButton
            variant="unstyled"
            onClick={handleTransferClick}
            className="inline-flex h-7 shrink-0 items-center justify-center rounded-full bg-white/20 px-4 text-xs font-medium text-white transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            {t("main.transfer")}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
