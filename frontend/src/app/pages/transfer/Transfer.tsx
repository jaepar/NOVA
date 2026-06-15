import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppButton } from "../../components/design-system";
import { BottomSheet } from "../../components/layout/BottomSheet";
import { MobileLayout } from "../../components/layout/MobileLayout";
import {
  detectAccountNumber,
  type TransferBankOption,
  TRANSFER_BANK_OPTIONS,
} from "../../data/accountNumberDetector";

type TransferStep =
  | "account"
  | "amount"
  | "amountConfirm"
  | "editRecipientMemo"
  | "editSenderMemo"
  | "review"
  | "complete";

type BankOption = TransferBankOption;

const BANK_OPTIONS = TRANSFER_BANK_OPTIONS;

const REQUIRED_ACCOUNT_LENGTH = 10;
const SOURCE_BANK =
  BANK_OPTIONS.find((bank) => bank.id === "woori") ?? BANK_OPTIONS[0];
const SOURCE_ACCOUNT = "1002-867-390781";
const RECIPIENT_NAME = "백민정";

const BANK_LOGO_SRC: Record<string, string> = {
  woori: new URL("./transfer/assets/woori.png", import.meta.url).href,
  hana: new URL("./transfer/assets/hana.png", import.meta.url).href,
  kb: new URL("./transfer/assets/kb.png", import.meta.url).href,
  shinhan: new URL("./transfer/assets/shinhan.png", import.meta.url).href,
  nonghyup: new URL("./transfer/assets/nonghyup.png", import.meta.url).href,
  ibk: new URL("./transfer/assets/ibk.png", import.meta.url).href,
  kakao: new URL("./transfer/assets/kakao.png", import.meta.url).href,
  toss: new URL("./transfer/assets/toss.png", import.meta.url).href,
  sc: new URL("./transfer/assets/sc.png", import.meta.url).href,
  busan: new URL("./transfer/assets/busan.png", import.meta.url).href,
  kbank: new URL("./transfer/assets/kbank.png", import.meta.url).href,
  suhyup: new URL("./transfer/assets/suhyup.png", import.meta.url).href,
};

function normalizeAccountNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 14);
}

function formatCurrency(value: string) {
  const amount = Number(value || "0");
  return `${amount.toLocaleString("ko-KR")}원`;
}

function BankMark({
  bank,
  size = "md",
}: {
  bank: BankOption;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const sizeClassName = {
    xs: "h-4 w-4",
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-9 w-9",
  }[size];
  const logoSrc = BANK_LOGO_SRC[bank.id];

  return (
    <img
      src={logoSrc}
      alt=""
      aria-hidden="true"
      className={`shrink-0 object-contain ${sizeClassName}`}
    />
  );
}

function NumericKeypad({
  onPress,
  onBackspace,
  onClear,
  showClear = false,
}: {
  onPress: (value: string) => void;
  onBackspace: () => void;
  onClear?: () => void;
  showClear?: boolean;
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="grid grid-cols-3 gap-y-5 text-[#30343B]">
      {keys.map((key) => (
        <AppButton
          key={key}
          type="button"
          variant="unstyled"
          onClick={() => onPress(key)}
          className="h-10 text-[27px] font-medium leading-none"
        >
          {key}
        </AppButton>
      ))}
      <AppButton
        type="button"
        variant="unstyled"
        onClick={showClear ? onClear : () => onPress("00")}
        className="h-10 text-[18px] font-semibold leading-none"
      >
        {showClear ? "전체삭제" : "00"}
      </AppButton>
      <AppButton
        type="button"
        variant="unstyled"
        onClick={() => onPress("0")}
        className="h-10 text-[27px] font-medium leading-none"
      >
        0
      </AppButton>
      <AppButton
        type="button"
        variant="unstyled"
        onClick={onBackspace}
        className="h-10 text-[29px] font-medium leading-none"
      >
        ←
      </AppButton>
    </div>
  );
}

function AccountContinueHint() {
  return (
    <div className="mt-5 flex items-center justify-center gap-3 text-[15px] font-semibold text-[#59606A]">
      <span>계좌번호를 계속 입력해주세요</span>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className="h-2.5 w-2.5 rounded-full bg-[#006BFF] animate-transfer-bank-dot"
            style={{ animationDelay: `${index * 0.14}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function Transfer() {
  const navigate = useNavigate();
  const [step, setStep] = useState<TransferStep>("account");
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState<BankOption | null>(null);
  const [isBankSheetOpen, setIsBankSheetOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isAmountKeypadOpen, setIsAmountKeypadOpen] = useState(false);
  const [isPasswordSheetOpen, setIsPasswordSheetOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [recipientMemoName, setRecipientMemoName] = useState(RECIPIENT_NAME);
  const [senderMemoName, setSenderMemoName] = useState(RECIPIENT_NAME);
  const [memoDraft, setMemoDraft] = useState("");

  const detectedBanks = useMemo(
    () => detectAccountNumber(accountNumber),
    [accountNumber],
  );
  const suggestedBanks = useMemo(() => {
    const detectedBankIds = new Set(detectedBanks.map((bank) => bank.bankId));

    return BANK_OPTIONS.filter((bank) => detectedBankIds.has(bank.id));
  }, [detectedBanks]);
  const isNextEnabled =
    accountNumber.length >= REQUIRED_ACCOUNT_LENGTH && selectedBank !== null;
  const hasTransferAmount = Number(amount) > 0;
  const shouldShowAccountContinueHint =
    accountNumber.length > 0 &&
    suggestedBanks.length === 0 &&
    selectedBank === null;

  useEffect(() => {
    if (step === "amount") {
      setIsAmountKeypadOpen(true);
      return;
    }

    setIsAmountKeypadOpen(false);
  }, [step]);

  const handleAccountChange = (value: string) => {
    const nextValue = normalizeAccountNumber(value);
    const detectedBankIds = new Set(
      detectAccountNumber(nextValue).map((bank) => bank.bankId),
    );

    setAccountNumber(nextValue);

    if (
      selectedBank &&
      detectedBankIds.size > 0 &&
      !detectedBankIds.has(selectedBank.id)
    ) {
      setSelectedBank(null);
    }
  };

  const handleSelectBank = (bank: BankOption) => {
    setSelectedBank(bank);
    setIsBankSheetOpen(false);
  };

  const handleBack = () => {
    if (step === "account") {
      navigate("/main");
    } else if (step === "amount") {
      setStep("account");
    } else if (step === "amountConfirm") {
      setStep("amount");
    } else if (step === "editRecipientMemo" || step === "editSenderMemo") {
      setStep("amountConfirm");
    } else if (step === "review") {
      setStep("amountConfirm");
    } else {
      navigate("/main");
    }
  };

  const handleAmountPress = (value: string) => {
    setAmount((current) => {
      const next = `${current}${value}`.replace(/^0+/, "");
      return next.slice(0, 9);
    });
  };

  const handlePasswordPress = (value: string) => {
    setPassword((current) => {
      if (current.length >= 4) return current;

      const next = `${current}${value}`.slice(0, 4);
      if (next.length === 4) {
        window.setTimeout(() => {
          setIsPasswordSheetOpen(false);
          setStep("complete");
        }, 150);
      }
      return next;
    });
  };

  const handleStartMemoEdit = (
    memoStep: Extract<TransferStep, "editRecipientMemo" | "editSenderMemo">,
  ) => {
    setMemoDraft(
      memoStep === "editRecipientMemo" ? recipientMemoName : senderMemoName,
    );
    setStep(memoStep);
  };

  const handleCompleteMemoEdit = () => {
    const nextName = memoDraft.trim();
    if (!nextName) return;

    if (step === "editRecipientMemo") {
      setRecipientMemoName(nextName);
    } else if (step === "editSenderMemo") {
      setSenderMemoName(nextName);
    }

    setStep("amountConfirm");
  };

  const recipientBank =
    selectedBank ??
    BANK_OPTIONS.find((bank) => bank.id === "nonghyup") ??
    BANK_OPTIONS[0];
  const recipientAccount = accountNumber || "1122261925003";
  const amountText = formatCurrency(amount);

  const renderAccountStep = () => (
    <>
      <MobileLayout
        title="이체"
        headerType="back"
        onBack={handleBack}
        headerTextColor="#020A2F"
        bottomContent={
          <AppButton
            type="button"
            variant="unstyled"
            disabled={!isNextEnabled}
            onClick={() => {
              setIsAmountKeypadOpen(true);
              setStep("amount");
            }}
            className="h-16 w-full rounded-xl bg-[#006BFF] px-6 text-[18px] font-semibold text-white transition-colors disabled:bg-[#AEB2F3] disabled:font-medium disabled:cursor-not-allowed"
          >
            다음
          </AppButton>
        }
      >
        <section className="pt-5 text-[#020A2F]">
          <h2 className="text-[25px] font-bold leading-tight tracking-normal">
            어떤 계좌로 보낼까요?
          </h2>

          <div className="mt-7">
            <label
              htmlFor="transfer-account-number"
              className="text-sm font-medium"
            >
              계좌번호 입력
            </label>
            <div className="relative mt-3">
              <input
                id="transfer-account-number"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={accountNumber}
                onChange={(event) => handleAccountChange(event.target.value)}
                placeholder="'-' 없이 숫자만 입력"
                className="h-[58px] w-full rounded-lg border border-[#CBD2E1] bg-white px-4 pr-12 text-[17px] font-medium outline-none transition-colors placeholder:text-[#A5ABBE] focus:border-[#075BFF] focus:ring-1 focus:ring-[#075BFF]"
              />
              {accountNumber ? (
                <AppButton
                  type="button"
                  variant="unstyled"
                  aria-label="계좌번호 지우기"
                  onClick={() => {
                    setAccountNumber("");
                    setSelectedBank(null);
                  }}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#A5ABBE]"
                >
                  <X className="h-5 w-5 fill-current" />
                </AppButton>
              ) : null}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium">은행 선택</p>
            <AppButton
              type="button"
              variant="unstyled"
              onClick={() => setIsBankSheetOpen(true)}
              className="mt-3 flex h-[58px] w-full items-center justify-between rounded-lg border border-[#CBD2E1] bg-white px-4 text-left text-[16px] transition-colors hover:bg-[#F7F9FC]"
            >
              {selectedBank ? (
                <span className="flex items-center gap-3 text-[#020A2F]">
                  <BankMark bank={selectedBank} size="sm" />
                  {selectedBank.name}
                </span>
              ) : (
                <span className="text-[#687089]">은행을 선택해주세요</span>
              )}
              <ChevronDown className="h-5 w-5 text-[#020A2F]" />
            </AppButton>
          </div>

          {suggestedBanks.length > 0 ? (
            <div className="mt-6 grid grid-cols-3 justify-items-start gap-x-2 gap-y-3">
              {suggestedBanks.map((bank) => (
                <AppButton
                  key={bank.id}
                  type="button"
                  variant="unstyled"
                  onClick={() => handleSelectBank(bank)}
                  className={`flex h-9 w-[104px] items-center justify-center gap-1 rounded-full border px-1.5 text-[11px] font-medium leading-none transition-colors ${
                    selectedBank?.id === bank.id
                      ? "border-[#075BFF] bg-blue-50 text-[#075BFF]"
                      : "border-[#E2E7F0] bg-white text-[#020A2F] hover:bg-[#F7F9FC]"
                  }`}
                >
                  <BankMark bank={bank} size="xs" />
                  <span className="whitespace-nowrap">{bank.name}</span>
                </AppButton>
              ))}
            </div>
          ) : shouldShowAccountContinueHint ? (
            <AccountContinueHint />
          ) : null}
        </section>
      </MobileLayout>

      <BottomSheet
        isOpen={isBankSheetOpen}
        onClose={() => setIsBankSheetOpen(false)}
        title="은행을 선택해주세요"
        height="440px"
      >
        <div className="grid grid-cols-3 gap-2">
          {BANK_OPTIONS.map((bank) => (
            <AppButton
              key={bank.id}
              type="button"
              variant="unstyled"
              onClick={() => handleSelectBank(bank)}
              className={`flex h-[78px] flex-col items-center justify-center gap-1.5 rounded-lg border text-[12px] font-medium transition-colors ${
                selectedBank?.id === bank.id
                  ? "border-[#075BFF] bg-blue-50 text-[#075BFF]"
                  : "border-[#E2E7F0] bg-white text-[#020A2F] hover:bg-[#F7F9FC]"
              }`}
            >
              <BankMark bank={bank} size="lg" />
              <span className="whitespace-nowrap leading-none">
                {bank.name}
              </span>
            </AppButton>
          ))}
        </div>
      </BottomSheet>
    </>
  );

  const renderTransferHeader = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-[16px] font-bold text-[#202633]">
          <BankMark bank={SOURCE_BANK} size="md" />
          <span>우리은행 계좌에서</span>
          <ChevronDown className="h-4 w-4" />
        </div>
        <p className="mt-1 text-[13px] font-semibold text-[#8A9099]">
          우리SUPER주거래통장 {SOURCE_ACCOUNT}
        </p>
      </div>
      <div>
        <div className="flex items-center gap-2 text-[16px] font-bold text-[#202633]">
          <BankMark bank={recipientBank} size="md" />
          <span>{RECIPIENT_NAME} 님 계좌로</span>
          <ChevronDown className="h-4 w-4" />
        </div>
        <p className="mt-1 text-[13px] font-semibold text-[#8A9099]">
          {recipientBank.name.replace("은행", "")} {recipientAccount}
        </p>
      </div>
    </div>
  );

  const renderAmountStep = () => (
    <>
      <MobileLayout title="" headerType="back" onBack={handleBack}>
        <section className="pt-2 text-[#202633]">
          {renderTransferHeader()}

          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => setIsAmountKeypadOpen(true)}
            className="mt-16 block w-full text-center"
          >
            {amount ? (
              <>
                <h2 className="text-[42px] font-bold leading-tight text-[#050B2D]">
                  {amountText}
                </h2>
                <p className="mt-3 text-[18px] font-semibold text-[#30343B]">
                  출금 가능 금액 {amountText}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-[28px] font-bold text-[#8C929B]">
                  얼마를 이체하시겠어요?
                </h2>
                <p className="mt-5 text-[17px] font-semibold text-[#8C929B]">
                  출금 가능 금액 0원
                </p>
              </>
            )}
          </AppButton>
        </section>
      </MobileLayout>

      <BottomSheet
        isOpen={isAmountKeypadOpen}
        onClose={() => setIsAmountKeypadOpen(false)}
        title=""
        height="410px"
        disableScroll
        dimBackground={false}
      >
        <div className="flex h-full flex-col">
          <div className="grid grid-cols-5 gap-2">
            {["+1만", "+5만", "+10만", "+100만", "전액"].map((chip) => (
              <AppButton
                key={chip}
                type="button"
                variant="unstyled"
                onClick={() =>
                  setAmount(
                    chip === "전액" ? "1000000" : chip.replace(/\D/g, "0000"),
                  )
                }
                className="h-9 rounded-md bg-[#F1F3F5] text-[13px] font-bold text-[#454B52]"
              >
                {chip}
              </AppButton>
            ))}
          </div>
          <div className="mt-7">
            <NumericKeypad
              onPress={handleAmountPress}
              onBackspace={() => setAmount((current) => current.slice(0, -1))}
            />
          </div>
          <AppButton
            type="button"
            variant="unstyled"
            disabled={!hasTransferAmount}
            onClick={() => {
              setIsAmountKeypadOpen(false);
              setStep("amountConfirm");
            }}
            className="mt-auto h-[58px] w-full rounded-xl bg-[#006BFF] text-[18px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-[#BFDAFA]"
          >
            확인
          </AppButton>
        </div>
      </BottomSheet>
    </>
  );

  const renderAmountConfirmStep = () => (
    <MobileLayout
      title=""
      headerType="back"
      onBack={handleBack}
      bottomContent={
        <AppButton
          type="button"
          variant="unstyled"
          onClick={() => setStep("review")}
          className="h-[54px] w-full rounded-lg bg-[#006BFF] text-[17px] font-semibold text-white"
        >
          다음
        </AppButton>
      }
    >
      <section className="pt-3 text-[#202633]">
        {renderTransferHeader()}
        <div className="mt-14 text-center">
          <h2 className="text-[42px] font-bold leading-tight text-[#050B2D]">
            {amountText}
          </h2>
          <p className="mt-4 text-[18px] font-semibold text-[#30343B]">
            출금 가능 금액 {amountText}
          </p>
        </div>

        <div className="mt-32 space-y-9 text-[18px] font-bold text-[#202633]">
          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => handleStartMemoEdit("editRecipientMemo")}
            className="flex w-full items-center justify-between text-left"
          >
            <span>받는 분 통장표기</span>
            <span className="flex items-center gap-4 text-[#59606A]">
              {recipientMemoName}
              <ChevronRight className="h-6 w-6" />
            </span>
          </AppButton>
          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => handleStartMemoEdit("editSenderMemo")}
            className="flex w-full items-center justify-between text-left"
          >
            <span>내 통장표기</span>
            <span className="flex items-center gap-4 text-[#59606A]">
              {senderMemoName}
              <ChevronRight className="h-6 w-6" />
            </span>
          </AppButton>
        </div>
      </section>
    </MobileLayout>
  );

  const renderMemoEditStep = () => {
    const isRecipientMemo = step === "editRecipientMemo";
    const title = isRecipientMemo ? "받는 분 통장표기" : "내 통장표기";
    const currentLength = memoDraft.length;

    return (
      <MobileLayout
        title={title}
        headerType="back"
        onBack={() => setStep("amountConfirm")}
        headerRightContent={
          <AppButton
            type="button"
            variant="unstyled"
            disabled={!memoDraft.trim()}
            onClick={handleCompleteMemoEdit}
            className="text-[15px] font-semibold text-[#006BFF] disabled:text-[#A5ABBE]"
          >
            완료
          </AppButton>
        }
      >
        <section className="pt-5 text-[#202633]">
          <div>
            <div className="flex items-center gap-2 text-[16px] font-bold">
              <BankMark
                bank={isRecipientMemo ? recipientBank : SOURCE_BANK}
                size="md"
              />
              <span>
                {isRecipientMemo
                  ? `${RECIPIENT_NAME} 님 계좌로`
                  : "우리은행 계좌에서"}
              </span>
              <ChevronDown className="h-4 w-4" />
            </div>
            <p className="mt-2 text-[13px] font-semibold text-[#8A9099]">
              {isRecipientMemo
                ? `${recipientBank.name.replace("은행", "")} ${recipientAccount}`
                : `우리SUPER주거래통장 ${SOURCE_ACCOUNT}`}
            </p>
          </div>

          <div className="mt-10">
            <label
              htmlFor="transfer-memo-name"
              className="text-[14px] font-semibold"
            >
              통장표기 이름
            </label>
            <div className="relative mt-3">
              <input
                id="transfer-memo-name"
                type="text"
                value={memoDraft}
                maxLength={10}
                autoFocus
                onChange={(event) =>
                  setMemoDraft(event.target.value.slice(0, 10))
                }
                className="h-[58px] w-full rounded-lg border border-[#075BFF] bg-white px-4 pr-12 text-[17px] font-medium text-[#050B2D] outline-none ring-1 ring-[#075BFF] placeholder:text-[#A5ABBE]"
              />
              {memoDraft ? (
                <AppButton
                  type="button"
                  variant="unstyled"
                  aria-label="통장표기 이름 지우기"
                  onClick={() => setMemoDraft("")}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#A5ABBE]"
                >
                  <X className="h-5 w-5 fill-current" />
                </AppButton>
              ) : null}
            </div>
            <p className="mt-2 text-right text-[13px] font-semibold text-[#858B94]">
              {currentLength}/10
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-[#F7F7F8] px-5 py-5 text-[13px] font-semibold leading-7 text-[#7B828C]">
            <p className="mb-2 text-[14px] font-bold text-[#30343B]">안내</p>
            <p>
              ·{" "}
              {isRecipientMemo
                ? "받는 분 통장에 표시될 이름입니다."
                : "내 통장에 표시될 이름입니다."}
            </p>
            <p>· 최대 10자까지 입력할 수 있습니다.</p>
            <p>
              ·{" "}
              {isRecipientMemo
                ? "이체 시 이 이름으로 표시됩니다."
                : "이체 내역에서 이 이름으로 표시됩니다."}
            </p>
          </div>
        </section>
      </MobileLayout>
    );
  };

  const renderReviewStep = () => (
    <>
      <MobileLayout
        title=""
        headerType="back"
        onBack={handleBack}
        bottomContent={
          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => {
              setPassword("");
              setIsPasswordSheetOpen(true);
            }}
            className="h-[54px] w-full rounded-lg bg-[#2F80ED] text-[17px] font-semibold text-white"
          >
            이체
          </AppButton>
        }
      >
        <section className="pt-12 text-[#202633]">
          <div className="flex items-center gap-7">
            <BankMark bank={SOURCE_BANK} size="lg" />
            <BankMark bank={recipientBank} size="lg" />
          </div>

          <h2 className="mt-9 text-[24px] font-bold leading-snug">
            <span className="text-[#006BFF]">{RECIPIENT_NAME}</span> 님에게
            <br />
            <span className="text-[#006BFF]">{amountText}</span>을
            이체하시겠어요?
          </h2>
          <p className="mt-4 text-[14px] font-semibold text-[#8A9099]">
            {recipientBank.name.replace("은행", "")} {recipientAccount} 계좌로
            보냅니다.
          </p>

          <div className="mt-8 rounded-2xl bg-[#F7F7F8] px-5 py-5 text-[15px]">
            <div className="flex justify-between py-2">
              <span className="text-[#7B828C]">수수료</span>
              <span className="font-bold">면제</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#7B828C]">받는 분 통장표기</span>
              <span className="font-bold">{recipientMemoName}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#7B828C]">내 통장표기</span>
              <span className="font-bold">{senderMemoName}</span>
            </div>
          </div>
        </section>
      </MobileLayout>

      <BottomSheet
        isOpen={isPasswordSheetOpen}
        onClose={() => setIsPasswordSheetOpen(false)}
        title=""
        height="500px"
        disableScroll
      >
        <div className="relative text-center text-[#30343B]">
          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => setIsPasswordSheetOpen(false)}
            className="absolute right-0 top-0 text-[34px] leading-none"
          >
            ×
          </AppButton>
          <h2 className="pt-8 text-[20px] font-bold">계좌 비밀번호</h2>
          <div className="mt-12 flex justify-center gap-5">
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={`h-4 w-4 rounded-full border border-[#6D7680] ${
                  password.length > index ? "bg-[#30343B]" : "bg-white"
                }`}
              />
            ))}
          </div>
          <div className="mt-12">
            <NumericKeypad
              showClear
              onPress={handlePasswordPress}
              onClear={() => setPassword("")}
              onBackspace={() => setPassword((current) => current.slice(0, -1))}
            />
          </div>
        </div>
      </BottomSheet>
    </>
  );

  const renderCompleteStep = () => (
    <MobileLayout
      title=""
      headerType="back"
      onBack={() => navigate("/main")}
      bottomContent={
        <AppButton
          type="button"
          variant="unstyled"
          onClick={() => navigate("/main")}
          className="h-[54px] w-full rounded-lg bg-[#2F80ED] text-[17px] font-semibold text-white"
        >
          확인
        </AppButton>
      }
    >
      <section className="pt-20 text-center text-[#30343B]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#3F7FF0]">
          <Check className="h-9 w-9 text-white" strokeWidth={4} />
        </div>
        <h2 className="mt-8 text-[24px] font-bold leading-snug">
          {RECIPIENT_NAME} 님에게
          <br />
          이체했어요
        </h2>
        <div className="mt-12 rounded-2xl bg-[#F7F7F8] px-6 py-5 text-[15px]">
          <div className="flex justify-between py-2">
            <span className="text-[#7B828C]">받는 계좌</span>
            <span className="font-bold">
              {recipientBank.name.replace("은행", "")} {recipientAccount}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[#7B828C]">이체금액</span>
            <span className="font-bold">{amountText}</span>
          </div>
        </div>
      </section>
    </MobileLayout>
  );

  if (step === "amount") return renderAmountStep();
  if (step === "amountConfirm") return renderAmountConfirmStep();
  if (step === "editRecipientMemo" || step === "editSenderMemo")
    return renderMemoEditStep();
  if (step === "review") return renderReviewStep();
  if (step === "complete") return renderCompleteStep();

  return renderAccountStep();
}
