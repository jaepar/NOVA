import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Shield, Wallet } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { PinInputBottomSheet } from "../../components/design-system/PinInputBottomSheet";
import { novaToast } from "../../components/design-system/toast";
import { bankingApi } from "../../../api";
import { useAccountCreateFlowStore } from "../../stores/pageStores";

const ACCOUNT_TYPE = "DEMAND_DEPOSIT";
const ACCOUNT_NAME = "우리 SUPER주거래 통장";

const JOB_CODE_MAP: Record<string, string> = {
  기업소득자: "EMPLOYED",
  자영업자: "SELF_EMPLOYED",
  전업투자자: "FULL_TIME_INVESTOR",
  연금소득자: "PENSIONER",
  주부: "HOMEMAKER",
  학생: "STUDENT",
  "무직 등": "UNEMPLOYED",
};

const PURPOSE_CODE_MAP: Record<string, string> = {
  "저축 및 투자": "SAVING_AND_INVESTMENT",
  "급여 및 생활비": "SALARY_AND_LIVING_EXPENSES",
  "사업상 거래": "BUSINESS_TRANSACTION",
  "상속·증여성 거래 등": "INHERITANCE_OR_GIFT",
};

const SOURCE_CODE_MAP: Record<string, string> = {
  "근로 및 연금소득": "EARNED_AND_PENSION_INCOME",
  사업소득: "BUSINESS_INCOME",
  금융소득: "FINANCIAL_INCOME",
  기타: "OTHER",
};

export function Step14AccountPasswordSetup() {
  const navigate = useNavigate();
  const [isPinSheetOpen, setIsPinSheetOpen] = useState(false);
  const [pinSetupStep, setPinSetupStep] = useState<"first" | "confirm">(
    "first"
  );
  const [firstPin, setFirstPin] = useState("");
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [pinSheetKey, setPinSheetKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const address = useAccountCreateFlowStore((state) => state.address);
  const addressDetail = useAccountCreateFlowStore((state) => state.addressDetail);
  const job = useAccountCreateFlowStore((state) => state.job);
  const transactionPurpose = useAccountCreateFlowStore(
    (state) => state.transactionPurpose
  );
  const fundSource = useAccountCreateFlowStore((state) => state.fundSource);
  const hasForeignTax = useAccountCreateFlowStore((state) => state.hasForeignTax);
  const resetAccountCreateFlow = useAccountCreateFlowStore((state) => state.reset);

  const handlePinComplete = (pin: string) => {
    if (pinSetupStep === "first") {
      setFirstPin(pin);
      setPinSetupStep("confirm");
      setPinSheetKey((prev) => prev + 1);
      return;
    }

    if (pin === firstPin) {
      setIsPinVerified(true);
      setIsPinSheetOpen(false);
      return;
    }

    setIsPinVerified(false);
    novaToast.error("비밀번호가 일치하지 않습니다. 다시 입력해 주세요.");
    setPinSetupStep("confirm");
    setPinSheetKey((prev) => prev + 1);
  };

  const handlePrimaryAction = () => {
    if (!isPinVerified) {
      setPinSetupStep("first");
      setFirstPin("");
      setPinSheetKey((prev) => prev + 1);
      setIsPinSheetOpen(true);
      return;
    }

    void submitAccountCreate();
  };

  const handlePinSheetClose = () => {
    setIsPinSheetOpen(false);
    if (!isPinVerified) {
      setPinSetupStep("first");
      setFirstPin("");
      setPinSheetKey((prev) => prev + 1);
    }
  };

  const resetPinState = () => {
    setFirstPin("");
    setIsPinVerified(false);
    setPinSetupStep("first");
    setPinSheetKey((prev) => prev + 1);
  };

  const submitAccountCreate = async () => {
    const jobCode = JOB_CODE_MAP[job];
    const purposeCode = PURPOSE_CODE_MAP[transactionPurpose];
    const sourceCode = SOURCE_CODE_MAP[fundSource];

    if (!address || !addressDetail || !jobCode || !purposeCode || !sourceCode || !firstPin) {
      novaToast.error("계좌 개설 정보가 올바르지 않습니다. 이전 단계부터 다시 확인해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      await bankingApi.createAccount({
        accountType: ACCOUNT_TYPE,
        accountName: ACCOUNT_NAME,
        customerInfo: {
          address,
          addressDetail,
        },
        job: jobCode,
        transactionInfo: {
          purpose: purposeCode,
          source: sourceCode,
        },
        hasForeignTax,
        accountPassword: firstPin,
      });

      resetPinState();
      resetAccountCreateFlow();
      navigate("/account/step-15");
    } catch {
      resetPinState();
      setIsPinSheetOpen(true);
      novaToast.error("계좌 개설 요청에 실패했습니다. 비밀번호를 다시 입력해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <MobileLayout
        title="입출금계좌 개설"
        backPath="/account/step-13"
        bottomContent={
          <Btn_1Col onClick={handlePrimaryAction} disabled={isSubmitting}>
            {isSubmitting ? "처리 중" : isPinVerified ? "다음" : "비밀번호 등록하기"}
          </Btn_1Col>
        }
      >
        <div className="space-y-8 pb-2">
          <section className="space-y-2 text-center pt-6">
            <h2 className="text-2xl leading-tight font-semibold text-foreground">
              계좌 비밀번호를
              <br />
              등록해 주세요
            </h2>
          </section>

          <section className="flex justify-center">
            <div className="h-36 w-36 rounded-full bg-secondary flex items-center justify-center">
              <div className="h-20 w-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
                <Lock className="w-10 h-10" />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <p className="text-sm text-foreground">
                금융사기 피해예방을 위해
                <br />
                한도제한계좌로 개설됩니다
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3">
              <Wallet className="w-5 h-5 text-primary mt-0.5" />
              <p className="text-sm text-foreground">
                1일 이체한도 30만원으로
                <br />
                자동 설정됩니다
              </p>
            </div>
          </section>
        </div>
      </MobileLayout>

      <PinInputBottomSheet
        key={pinSheetKey}
        isOpen={isPinSheetOpen}
        onClose={handlePinSheetClose}
        title={
          pinSetupStep === "first"
            ? "사용하실 비밀번호를 입력해 주세요"
            : "비밀번호를 한 번 더 입력해 주세요"
        }
        pinLength={4}
        onComplete={handlePinComplete}
      />
    </>
  );
}
