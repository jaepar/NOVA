import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Shield, Wallet } from "lucide-react";
import { AccountMobileLayout } from "./components/AccountMobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { PinInputBottomSheet } from "../../components/design-system/PinInputBottomSheet";
import { novaToast } from "../../components/design-system/toast";
import { bankingApi } from "../../../api";
import { useAccountCreateFlowStore } from "../../stores/pageStores";
import { useTranslation } from "../../i18n";

const ACCOUNT_TYPE = "DEMAND_DEPOSIT";
const ACCOUNT_NAME = "우리 SUPER주거래 통장";

const JOB_CODES = new Set([
  "EMPLOYED",
  "SELF_EMPLOYED",
  "FULL_TIME_INVESTOR",
  "PENSIONER",
  "HOMEMAKER",
  "STUDENT",
  "UNEMPLOYED",
]);

const PURPOSE_CODES = new Set([
  "SAVING_AND_INVESTMENT",
  "SALARY_AND_LIVING_EXPENSES",
  "BUSINESS_TRANSACTION",
  "INHERITANCE_OR_GIFT",
]);

const SOURCE_CODES = new Set([
  "EARNED_AND_PENSION_INCOME",
  "BUSINESS_INCOME",
  "FINANCIAL_INCOME",
  "OTHER",
]);

export function Step14AccountPasswordSetup() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    novaToast.error(t("account.passwordSetup.mismatch"));
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
    if (
      !address ||
      !addressDetail ||
      !JOB_CODES.has(job) ||
      !PURPOSE_CODES.has(transactionPurpose) ||
      !SOURCE_CODES.has(fundSource) ||
      !firstPin
    ) {
      novaToast.error(t("account.passwordSetup.invalidInfo"));
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
        job,
        transactionInfo: {
          purpose: transactionPurpose,
          source: fundSource,
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
      novaToast.error(t("account.passwordSetup.createFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AccountMobileLayout
        title={t("account.openingHeader")}
        titleKey="account.openingHeader"
        backPath="/account/step-13"
        bottomContent={
          <Btn_1Col onClick={handlePrimaryAction} disabled={isSubmitting}>
            {isSubmitting
              ? t("account.passwordSetup.submitting")
              : isPinVerified
                ? t("account.next")
                : t("account.passwordSetup.registerPassword")}
          </Btn_1Col>
        }
      >
        <div className="space-y-8 pb-2">
          <section className="space-y-2 text-center pt-6">
            <h2 className="text-2xl leading-tight font-semibold text-foreground">
              {t("account.passwordSetup.heading")
                .split("\n")
                .map((line, index, lines) => (
                  <span key={`${line}-${index}`}>
                    {line}
                    {index < lines.length - 1 && <br />}
                  </span>
                ))}
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
                {t("account.passwordSetup.limitNotice")
                  .split("\n")
                  .map((line, index, lines) => (
                    <span key={`${line}-${index}`}>
                      {line}
                      {index < lines.length - 1 && <br />}
                    </span>
                  ))}
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3">
              <Wallet className="w-5 h-5 text-primary mt-0.5" />
              <p className="text-sm text-foreground">
                {t("account.passwordSetup.transferLimitNotice")
                  .split("\n")
                  .map((line, index, lines) => (
                    <span key={`${line}-${index}`}>
                      {line}
                      {index < lines.length - 1 && <br />}
                    </span>
                  ))}
              </p>
            </div>
          </section>
        </div>
      </AccountMobileLayout>

      <PinInputBottomSheet
        key={pinSheetKey}
        isOpen={isPinSheetOpen}
        onClose={handlePinSheetClose}
        title={
          pinSetupStep === "first"
            ? t("account.passwordSetup.pinFirstTitle")
            : t("account.passwordSetup.pinConfirmTitle")
        }
        pinLength={4}
        onComplete={handlePinComplete}
      />
    </>
  );
}
