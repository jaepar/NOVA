import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppButton } from "../../components/design-system/AppButton";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { WalletAccountCard } from "./components/WalletAccountCard";
import { WalletAmountChip } from "./components/WalletAmountChip";

const quickAmounts = [10000, 30000, 50000];
const walletBalance = 3220000;

type ChargeFeedback = {
  type: "error";
  message: string;
};

type ChargeSuccess = {
  amount: number;
  chargedAt: Date;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function WalletCharge() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [feedback, setFeedback] = useState<ChargeFeedback | null>(null);
  const [success, setSuccess] = useState<ChargeSuccess | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericAmount = Number(amount || 0);
  const formattedAmount = useMemo(
    () => numericAmount.toLocaleString("ko-KR"),
    [numericAmount],
  );
  const balanceAfterCharge = success ? walletBalance + success.amount : 0;
  const formattedBalanceAfterCharge = balanceAfterCharge.toLocaleString("ko-KR");
  const chargedAtText =
    success?.chargedAt
      .toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/\. /g, ". ")
      .replace(".", ".")
      .trim() ?? "";

  const handleQuickAmount = (nextAmount: number) => {
    setFeedback(null);
    setSuccess(null);
    setAmount(String(numericAmount + nextAmount));
  };

  const handleInputChange = (value: string) => {
    setFeedback(null);
    setSuccess(null);
    setAmount(onlyDigits(value));
  };

  const requestCharge = async () => {
    if (numericAmount <= 0) {
      throw new Error("충전 금액을 입력해주세요.");
    }

    // TODO: 백엔드 충전 API 연결 시 이 함수 내부를 실제 요청으로 교체합니다.
    await Promise.resolve();
  };

  const handleConfirm = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await requestCharge();
      setSuccess({
        amount: numericAmount,
        chargedAt: new Date(),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.";

      setFeedback({
        type: "error",
        message: `충전에 실패했습니다. ${message}`,
      });
      setIsSubmitting(false);
    }
  };

  const handleSuccessConfirm = () => {
    navigate("/wallet/home");
  };

  return (
    <>
      <MobileLayout
        title="충전"
        bottomContent={
          <div className="space-y-3">
            {feedback && (
              <div
                role="alert"
                className="rounded-xl bg-[#fff2f2] px-4 py-3 text-center text-[14px] font-medium text-[#d92d20] shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
              >
                {feedback.message}
              </div>
            )}

            <AppButton
              type="button"
              variant="unstyled"
              disabled={numericAmount <= 0 || isSubmitting}
              onClick={handleConfirm}
              className="h-[56px] w-full rounded-lg bg-black text-[17px] font-semibold text-white transition-colors disabled:opacity-40"
            >
              확인
            </AppButton>
          </div>
        }
      >
        <div className="space-y-7 pt-6">
          <section className="rounded-[14px] border border-[#e4e4e4] bg-white px-5 py-5">
            <h2 className="text-[18px] font-semibold leading-7 text-[#111111]">
              충전 금액
            </h2>

            <div className="mt-7 border-b border-[#8d8d8d] pb-3">
              {numericAmount > 0 ? (
                <div className="flex items-center justify-between gap-3">
                  <label className="sr-only" htmlFor="wallet-charge-amount">
                    충전 금액
                  </label>
                  <input
                    id="wallet-charge-amount"
                    inputMode="numeric"
                    value={`${formattedAmount}원`}
                    onChange={(event) => handleInputChange(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-[28px] font-semibold leading-9 text-[#111111] outline-none"
                  />
                  <AppButton
                    type="button"
                    variant="unstyled"
                    aria-label="충전 금액 지우기"
                    onClick={() => setAmount("")}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#bfc1c8] text-white"
                  >
                    <X className="h-4 w-4" />
                  </AppButton>
                </div>
              ) : (
                <input
                  inputMode="numeric"
                  value={amount}
                  onChange={(event) => handleInputChange(event.target.value)}
                  placeholder="충전할 금액을 입력해주세요."
                  className="w-full bg-transparent text-[19px] leading-9 text-[#111111] outline-none placeholder:text-[#999999]"
                />
              )}
            </div>

            <div className="mt-8 flex gap-3">
              {quickAmounts.map((quickAmount) => (
                <WalletAmountChip
                  key={quickAmount}
                  amount={quickAmount}
                  onClick={handleQuickAmount}
                />
              ))}
            </div>
          </section>

          <WalletAccountCard />
        </div>
      </MobileLayout>

      {success && (
        <div
          className="fixed inset-0 z-50 mx-auto flex h-full w-full max-w-[390px] items-end bg-black/35"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wallet-charge-success-title"
        >
          <div className="w-full rounded-t-[24px] bg-white px-5 pb-7 pt-6 shadow-[0_-12px_32px_rgba(0,0,0,0.16)]">
            <div className="mx-auto mb-7 h-1 w-10 rounded-full bg-[#d7d7d7]" />

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#111111] text-white">
                <Check className="h-5 w-5" strokeWidth={2.4} />
              </div>
              <div>
                <h2
                  id="wallet-charge-success-title"
                  className="text-[18px] font-semibold leading-6 text-[#111111]"
                >
                  충전 완료
                </h2>
                <p className="mt-1 text-[14px] font-medium leading-5 text-[#8c8c8c]">
                  {chargedAtText}
                </p>
              </div>
            </div>

            <div className="my-6 h-px bg-[#eeeeee]" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-[#8c8c8c]">
                  충전 금액
                </span>
                <strong className="text-[15px] font-semibold text-[#111111]">
                  {success.amount.toLocaleString("ko-KR")}원
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-[#8c8c8c]">
                  충전 후 잔액
                </span>
                <strong className="text-[15px] font-semibold text-[#111111]">
                  {formattedBalanceAfterCharge}원
                </strong>
              </div>
            </div>

            <div
              role="status"
              className="sr-only"
            >
              {success.amount.toLocaleString("ko-KR")}원 충전이 완료되었습니다.
            </div>

            <AppButton
              type="button"
              variant="unstyled"
              onClick={handleSuccessConfirm}
              className="mt-6 h-[52px] w-full rounded-[12px] bg-black text-[16px] font-semibold text-white"
            >
              확인
            </AppButton>
          </div>
        </div>
      )}
    </>
  );
}
