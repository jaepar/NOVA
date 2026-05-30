import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AxiosError } from "axios";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { KeypadPressEvent } from "secure-keypad";
import { walletApi } from "../../../api";
import { AppButton } from "../../components/design-system/AppButton";
import { BottomSheet } from "../../components/layout/BottomSheet";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { WalletAccountCard } from "./components/WalletAccountCard";
import { WalletAmountChip } from "./components/WalletAmountChip";
import { walletPrimaryButtonClass } from "./styles";
import { useWalletStore } from "./stores/walletStore";

const quickAmounts = [10000, 30000, 50000];
const chargeMinimumAmount = 1000;
const chargeLimitAmount = 10000000;
const inputLimitAmount = 999999999;
const accountPasswordLength = 4;
const passwordSheetCloseDurationMs = 320;
const chargeCompletionLoadingMs = 700;
const chargeLimitMessage = "1회 충전 금액은 10,000,000원까지만 가능합니다.";

const SecureKeypad = lazy(() =>
  import("secure-keypad").then((module) => {
    document.getElementById("secure-keypad-styles")?.remove();

    return { default: module.Keypad };
  }),
);

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function getApiErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data;

    if (
      responseData &&
      typeof responseData === "object" &&
      "message" in responseData &&
      typeof responseData.message === "string"
    ) {
      return responseData.message;
    }
  }

  return error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.";
}

export function WalletCharge() {
  const navigate = useNavigate();
  const completionTimerIdsRef = useRef<number[]>([]);
  const [isPasswordSheetOpen, setIsPasswordSheetOpen] = useState(false);
  const [isCompletionLoading, setIsCompletionLoading] = useState(false);
  const [chargeFailureMessage, setChargeFailureMessage] = useState<string | null>(null);
  const [chargeFailedAt, setChargeFailedAt] = useState<Date | null>(null);
  const amount = useWalletStore((state) => state.chargeAmount);
  const accountPassword = useWalletStore((state) => state.chargeAccountPassword);
  const feedback = useWalletStore((state) => state.chargeFeedback);
  const success = useWalletStore((state) => state.chargeSuccess);
  const isSubmitting = useWalletStore((state) => state.isChargeSubmitting);
  const setAmount = useWalletStore((state) => state.setChargeAmount);
  const setAccountPassword = useWalletStore((state) => state.setChargeAccountPassword);
  const setFeedback = useWalletStore((state) => state.setChargeFeedback);
  const setSuccess = useWalletStore((state) => state.setChargeSuccess);
  const setIsSubmitting = useWalletStore((state) => state.setChargeSubmitting);
  const setWalletBalance = useWalletStore((state) => state.setWalletBalance);
  const clearChargeAmount = useWalletStore((state) => state.clearChargeAmount);
  const resetChargeFlow = useWalletStore((state) => state.resetChargeFlow);

  const numericAmount = Number(amount || 0);
  const formattedAmount = useMemo(
    () => numericAmount.toLocaleString("ko-KR"),
    [numericAmount],
  );
  const amountInputValue = numericAmount <= 0 ? amount : formattedAmount;
  const isChargeLimitExceeded = numericAmount > chargeLimitAmount;
  const isAccountPasswordComplete = accountPassword.length === accountPasswordLength;
  const formattedBalanceAfterCharge =
    success?.balanceAfterCharge !== null && success?.balanceAfterCharge !== undefined
      ? success.balanceAfterCharge.toLocaleString("ko-KR")
      : "확인 중";
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
  const chargeFailedAtText =
    chargeFailedAt
      ?.toLocaleString("ko-KR", {
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

  useEffect(() => {
    return () => {
      completionTimerIdsRef.current.forEach((timerId) => window.clearTimeout(timerId));
      resetChargeFlow();
    };
  }, [resetChargeFlow]);

  const wait = (durationMs: number) =>
    new Promise<void>((resolve) => {
      const timerId = window.setTimeout(resolve, durationMs);

      completionTimerIdsRef.current.push(timerId);
    });

  const updateAmount = (nextAmount: string) => {
    setSuccess(null);
    setAmount(nextAmount);

    if (Number(nextAmount || 0) > chargeLimitAmount) {
      setFeedback({
        type: "error",
        message: chargeLimitMessage,
      });
      return;
    }

    setFeedback(null);
  };

  const handleQuickAmount = (nextAmount: number) => {
    const nextTotalAmount = numericAmount + nextAmount;

    if (nextTotalAmount > inputLimitAmount) {
      return;
    }

    updateAmount(String(nextTotalAmount));
  };

  const handleInputChange = (value: string) => {
    const nextAmount = onlyDigits(value);

    if (Number(nextAmount || 0) > inputLimitAmount) {
      return;
    }

    updateAmount(nextAmount);
  };

  const handleKeypadPress = (event: KeypadPressEvent) => {
    if (event.type !== "num" || typeof event.value !== "number") {
      return;
    }

    if (accountPassword.length >= accountPasswordLength) {
      return;
    }

    setSuccess(null);
    setFeedback(null);
    setAccountPassword(`${accountPassword}${event.value}`.slice(0, accountPasswordLength));
  };

  const handleBackspacePassword = () => {
    setSuccess(null);
    setFeedback(null);
    setAccountPassword(accountPassword.slice(0, -1));
  };

  const handleClearPassword = () => {
    setSuccess(null);
    setFeedback(null);
    setAccountPassword("");
  };

  const validateChargeAmount = () => {
    if (numericAmount <= 0) {
      throw new Error("충전 금액을 입력해주세요.");
    }

    if (numericAmount < chargeMinimumAmount) {
      throw new Error("최소 충전 금액은 1,000원입니다.");
    }

    if (numericAmount > chargeLimitAmount) {
      throw new Error(chargeLimitMessage);
    }
  };

  const requestCharge = async () => {
    validateChargeAmount();

    if (!isAccountPasswordComplete) {
      throw new Error("계좌비밀번호 4자리를 입력해주세요.");
    }

    await walletApi.charge({ chargeAmount: numericAmount });

    try {
      const response = await walletApi.transactions();

      setWalletBalance(response.balance);
      return response.balance;
    } catch {
      return null;
    }
  };

  const openPasswordSheet = () => {
    try {
      validateChargeAmount();
      setFeedback(null);
      setAccountPassword("");
      setIsPasswordSheetOpen(true);
    } catch (error) {
      const message = getApiErrorMessage(error);

      setFeedback({
        type: "error",
        message,
      });
    }
  };

  const closePasswordSheet = () => {
    setIsPasswordSheetOpen(false);
    setAccountPassword("");
  };

  const handleConfirm = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    setChargeFailureMessage(null);
    setChargeFailedAt(null);

    try {
      validateChargeAmount();

      if (!isAccountPasswordComplete) {
        throw new Error("계좌비밀번호 4자리를 입력해주세요.");
      }
    } catch (error) {
      const message = getApiErrorMessage(error);

      setFeedback({
        type: "error",
        message,
      });
      setIsSubmitting(false);
      return;
    }

    const chargedAmount = numericAmount;

    setIsPasswordSheetOpen(false);
    setAccountPassword("");

    await wait(passwordSheetCloseDurationMs);
    setIsCompletionLoading(true);

    try {
      const balanceAfterCharge = await requestCharge();

      await wait(chargeCompletionLoadingMs);

      setSuccess({
        amount: chargedAmount,
        balanceAfterCharge,
        chargedAt: new Date(),
      });
    } catch (error) {
      const message = getApiErrorMessage(error);

      await wait(chargeCompletionLoadingMs);
      setChargeFailureMessage(`충전에 실패했습니다. ${message}`);
      setChargeFailedAt(new Date());
      setIsSubmitting(false);
    } finally {
      setIsCompletionLoading(false);
    }
  };

  const handleFailureConfirm = () => {
    setChargeFailureMessage(null);
    setChargeFailedAt(null);
  };

  const handleSuccessConfirm = () => {
    resetChargeFlow();
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
              disabled={
                numericAmount <= 0 ||
                isChargeLimitExceeded ||
                isSubmitting
              }
              onClick={openPasswordSheet}
              className={walletPrimaryButtonClass}
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
              <div className="flex items-center justify-between gap-3">
                <label className="sr-only" htmlFor="wallet-charge-amount">
                  충전 금액
                </label>
                <div className="relative flex h-9 min-w-0 flex-1 items-center gap-0">
                  {numericAmount > 0 && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute left-0 top-0 flex h-9 items-center"
                    >
                      <span className="text-[25px] font-extrabold leading-none text-[#111111]">
                        {amountInputValue}
                      </span>
                      <span className="ml-0.5 text-[25px] font-semibold leading-none text-[#111111]">
                        원
                      </span>
                    </div>
                  )}
                  <input
                    id="wallet-charge-amount"
                    inputMode="numeric"
                    value={amountInputValue}
                    onChange={(event) => handleInputChange(event.target.value)}
                    placeholder="충전할 금액을 입력해주세요."
                    style={
                      numericAmount > 0
                        ? {
                            fontSize: "25px",
                            fontWeight: 800,
                          }
                        : undefined
                    }
                    className={`min-w-0 flex-1 bg-transparent leading-9 outline-none placeholder:font-normal placeholder:text-[#999999] ${
                      numericAmount > 0
                        ? "text-[25px] font-extrabold text-transparent caret-[#111111]"
                        : "text-[19px] font-semibold text-[#111111]"
                    }`}
                  />
                </div>
                <AppButton
                  type="button"
                  variant="unstyled"
                  aria-label="충전 금액 지우기"
                  onClick={clearChargeAmount}
                  disabled={numericAmount <= 0}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#bfc1c8] text-white ${
                    numericAmount > 0 ? "" : "invisible pointer-events-none"
                  }`}
                >
                  <X className="h-4 w-4" />
                </AppButton>
              </div>
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

      <BottomSheet
        isOpen={isPasswordSheetOpen}
        onClose={closePasswordSheet}
        title=""
        disableScroll
      >
        <div className="space-y-5">
          <div>
            <h2 className="text-[20px] font-semibold leading-7 text-[#111111]">
              계좌 비밀번호
            </h2>
            <p className="mt-3 text-[15px] leading-6 text-[#666666]">
              충전을 완료하려면 계좌 비밀번호를 입력해주세요.
            </p>
            <div
              className="mt-5 flex h-12 items-center justify-center gap-3 rounded-[10px] bg-[#f6f7f9]"
              aria-label={`계좌비밀번호 ${accountPassword.length}자리 입력됨`}
            >
              {Array.from({ length: accountPasswordLength }).map((_, index) => (
                <span
                  key={index}
                  className={`h-3 w-3 rounded-full ${
                    index < accountPassword.length ? "bg-[#111111]" : "bg-[#d8dbe2]"
                  }`}
                />
              ))}
            </div>
          </div>

          {feedback && (
            <div
              role="alert"
              className="rounded-xl bg-[#fff2f2] px-4 py-3 text-center text-[14px] font-medium text-[#d92d20]"
            >
              {feedback.message}
            </div>
          )}

          <div className="wallet-secure-keypad overflow-hidden rounded-[14px]">
            <Suspense fallback={<div className="h-[144px] w-full rounded-[14px] border border-[#e5e7eb] bg-white" />}>
              <SecureKeypad
                shuffleKey
                mixedKey
                pressCooldown={120}
                onPress={handleKeypadPress}
                onBackspaceClick={handleBackspacePassword}
                onClearClick={handleClearPassword}
                onOkClick={handleConfirm}
              />
            </Suspense>
          </div>
        </div>
      </BottomSheet>

      {isCompletionLoading && (
        <div
          className="fixed inset-0 z-50 mx-auto flex h-full w-full max-w-[var(--app-width)] items-center justify-center bg-black/35 px-5"
          role="status"
          aria-live="polite"
        >
          <div className="flex w-full max-w-[260px] flex-col items-center rounded-[18px] bg-white px-6 py-7 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#d8dbe2] border-t-[#111111]" />
            <p className="mt-4 text-[16px] font-semibold text-[#111111]">
              충전 처리 중
            </p>
          </div>
        </div>
      )}

      {chargeFailureMessage && (
        <div
          className="fixed inset-0 z-50 mx-auto flex h-full w-full max-w-[var(--app-width)] items-end bg-black/35"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wallet-charge-failure-title"
        >
          <div className="w-full rounded-t-[24px] bg-white px-5 pb-5 pt-6 shadow-[0_-12px_32px_rgba(0,0,0,0.16)]">
            <div className="mx-auto mb-7 h-1 w-10 rounded-full bg-[#d7d7d7]" />

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f04438] text-white">
                <X className="h-5 w-5" strokeWidth={2.4} />
              </div>
              <div>
                <h2
                  id="wallet-charge-failure-title"
                  className="text-[18px] font-semibold leading-6 text-[#111111]"
                >
                  충전 실패
                </h2>
                <p className="mt-1 text-[14px] font-medium leading-5 text-[#8c8c8c]">
                  {chargeFailedAtText}
                </p>
              </div>
            </div>

            <div className="my-6 h-px bg-[#eeeeee]" />

            <p className="rounded-xl bg-[#fff2f2] px-4 py-3 text-[14px] font-medium leading-6 text-[#d92d20]">
              {chargeFailureMessage}
            </p>

            <AppButton
              type="button"
              variant="unstyled"
              onClick={handleFailureConfirm}
              className={`mt-6 ${walletPrimaryButtonClass}`}
            >
              확인
            </AppButton>
          </div>
        </div>
      )}

      {success && (
        <div
          className="fixed inset-0 z-50 mx-auto flex h-full w-full max-w-[var(--app-width)] items-end bg-black/35"
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
              className={`mt-6 ${walletPrimaryButtonClass}`}
            >
              확인
            </AppButton>
          </div>
        </div>
      )}
    </>
  );
}
