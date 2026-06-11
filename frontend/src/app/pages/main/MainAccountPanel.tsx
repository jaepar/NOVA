import type { KeyboardEvent, MouseEvent } from "react";
import { MoreVertical } from "lucide-react";
import { AppButton } from "../../components/design-system/AppButton";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { novaToast } from "../../components/design-system/toast";
import type { AccountHomeResponse } from "../../../api";

interface MainAccountPanelProps {
  isLoggedIn: boolean;
  accountHome: AccountHomeResponse | null;
  isLoading: boolean;
  onLoginClick: () => void;
  onOpenCertificateSheet: () => void;
  onOpenAccount: () => void;
  onAccountPanelClick: () => void;
}

export function MainAccountPanel({
  isLoggedIn,
  accountHome,
  isLoading,
  onLoginClick,
  onOpenCertificateSheet,
  onOpenAccount,
  onAccountPanelClick,
}: MainAccountPanelProps) {
  if (isLoggedIn && isLoading) {
    return (
      <div className="bg-secondary rounded-2xl p-6 min-h-[180px] flex flex-col justify-between">
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
      <div className="bg-secondary rounded-2xl p-6 min-h-[180px] flex flex-col justify-between">
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-base">안전한 금융 생활을 시작하세요</h3>
            <p className="text-sm leading-5 text-muted-foreground">로그인 후 금융 서비스를 이용할 수 있어요.</p>
          </div>
        </div>
        <div className="mt-5">
          <Btn_1Col onClick={onLoginClick}>로그인</Btn_1Col>
        </div>
      </div>
    );
  }

  if (!accountHome || accountHome.uiState === "NEED_CERTIFICATE") {
    return (
      <div className="bg-secondary rounded-2xl p-6 min-h-[180px] flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="font-semibold text-base">
            계좌 개설로 더 다양한 서비스를 이용하세요
          </h3>
          <p className="text-sm text-muted-foreground">
            인증서 발급 후 계좌 개설을 이어갈 수 있어요.
          </p>
        </div>
        <Btn_1Col onClick={onOpenCertificateSheet}>인증서 발급하기</Btn_1Col>
      </div>
    );
  }

  if (accountHome.uiState === "CERTIFICATE_ISSUING") {
    return (
      <div className="bg-secondary rounded-2xl p-6 min-h-[180px] flex flex-col justify-center">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-base">
              인증서 발급이 진행중이에요
            </h3>
            <p className="text-sm text-muted-foreground">
              발급이 완료되면 계좌 개설을 진행할 수 있어요.
            </p>
          </div>
          <p className="rounded-lg bg-background/60 px-3 py-2.5 text-center text-sm font-medium text-foreground">
            제출한 서류를 심사 중입니다.
          </p>
        </div>
      </div>
    );
  }

  if (accountHome.uiState === "READY_TO_OPEN_ACCOUNT") {
    return (
      <div className="bg-secondary rounded-2xl p-6 min-h-[180px] flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="font-semibold text-base">
            아직 계좌가 개설되지 않았어요.
          </h3>
          <p className="text-sm text-muted-foreground">
            계좌를 개설해 새로운 일상을 시작해보세요.
          </p>
        </div>
        <Btn_1Col onClick={onOpenAccount}>계좌 개설하기</Btn_1Col>
      </div>
    );
  }

  const account = accountHome.account;

  if (!account) {
    return null;
  }

  const handleCopyAccountNumber = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    try {
      await navigator.clipboard.writeText(account.accountNumber);
      novaToast.success("계좌번호가 복사되었습니다.");
    } catch {
      novaToast.error("계좌번호 복사에 실패했습니다.");
    }
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onAccountPanelClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onAccountPanelClick}
      onKeyDown={handlePanelKeyDown}
      className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white min-h-[180px] flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{account.accountName}</span>
              {account.hasLimit && (
                <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-medium">
                  한도제한
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

      <div>
        <p className="text-sm text-white/80 mb-1">잔액</p>
        <p className="text-2xl font-semibold">
          {account.balance.toLocaleString("ko-KR")} 원
        </p>
      </div>
    </div>
  );
}
