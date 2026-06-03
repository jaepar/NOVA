import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppButton } from "../../components/design-system/AppButton";
import { SegmentedOptionField } from "../../components/design-system/SegmentedOptionField";
import { BottomSheet } from "../../components/layout/BottomSheet";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { useTransferRecipientInfoPageStore } from "../../stores/pageStores";

const paymentReasonOptions = [
  "유학비",
  "생활비",
  "가족부양비",
  "의료비",
  "거래대금",
  "기타",
] as const;

const paymentDetailOptions = [
  { label: "사유 선택", value: "reason-select" as const },
  { label: "직접입력", value: "manual-input" as const },
] as const;

type RecipientSelectionSheet = "payment-reason" | null;

function ClearableInput({
  label,
  value,
  onChange,
  trailing,
  placeholder,
  multiline = false,
  labelAction,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  trailing?: React.ReactNode;
  placeholder?: string;
  multiline?: boolean;
  labelAction?: React.ReactNode;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-base text-foreground">{label}</label>
        {labelAction}
      </div>
      <div className="relative mt-[6px] overflow-hidden rounded-2xl border border-border bg-background">
        {multiline ? (
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="min-h-24 w-full resize-none bg-transparent px-5 py-4 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        ) : (
          <input
            type="text"
            inputMode={inputMode}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className={`h-16 w-full bg-transparent px-5 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none ${
              trailing ? "pr-16" : "pr-5"
            }`}
          />
        )}
        {trailing ? (
          <div className="absolute inset-y-0 right-4 flex items-center">
            {trailing}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function Step05TransferRecipientInfo() {
  const navigate = useNavigate();
  const recipientName = useTransferRecipientInfoPageStore(
    (state) => state.recipientName
  );
  const recipientAddress = useTransferRecipientInfoPageStore(
    (state) => state.recipientAddress
  );
  const recipientDetailAddress = useTransferRecipientInfoPageStore(
    (state) => state.recipientDetailAddress
  );
  const recipientDistrict = useTransferRecipientInfoPageStore(
    (state) => state.recipientDistrict
  );
  const recipientCity = useTransferRecipientInfoPageStore(
    (state) => state.recipientCity
  );
  const recipientPostalCode = useTransferRecipientInfoPageStore(
    (state) => state.recipientPostalCode
  );
  const recipientPhoneNumber = useTransferRecipientInfoPageStore(
    (state) => state.recipientPhoneNumber
  );
  const swiftCode = useTransferRecipientInfoPageStore(
    (state) => state.swiftCode
  );
  const accountNumber = useTransferRecipientInfoPageStore(
    (state) => state.accountNumber
  );
  const routingNumber = useTransferRecipientInfoPageStore(
    (state) => state.routingNumber
  );
  const bankBranchName = useTransferRecipientInfoPageStore(
    (state) => state.bankBranchName
  );
  const paymentDetailMode = useTransferRecipientInfoPageStore(
    (state) => state.paymentDetailMode
  );
  const paymentReason = useTransferRecipientInfoPageStore(
    (state) => state.paymentReason
  );
  const manualPaymentDetail = useTransferRecipientInfoPageStore(
    (state) => state.manualPaymentDetail
  );
  const setRecipientName = useTransferRecipientInfoPageStore(
    (state) => state.setRecipientName
  );
  const setRecipientAddress = useTransferRecipientInfoPageStore(
    (state) => state.setRecipientAddress
  );
  const setRecipientDetailAddress = useTransferRecipientInfoPageStore(
    (state) => state.setRecipientDetailAddress
  );
  const setRecipientDistrict = useTransferRecipientInfoPageStore(
    (state) => state.setRecipientDistrict
  );
  const setRecipientCity = useTransferRecipientInfoPageStore(
    (state) => state.setRecipientCity
  );
  const setRecipientPostalCode = useTransferRecipientInfoPageStore(
    (state) => state.setRecipientPostalCode
  );
  const setRecipientPhoneNumber = useTransferRecipientInfoPageStore(
    (state) => state.setRecipientPhoneNumber
  );
  const setSwiftCode = useTransferRecipientInfoPageStore(
    (state) => state.setSwiftCode
  );
  const setAccountNumber = useTransferRecipientInfoPageStore(
    (state) => state.setAccountNumber
  );
  const setRoutingNumber = useTransferRecipientInfoPageStore(
    (state) => state.setRoutingNumber
  );
  const setBankBranchName = useTransferRecipientInfoPageStore(
    (state) => state.setBankBranchName
  );
  const setPaymentDetailMode = useTransferRecipientInfoPageStore(
    (state) => state.setPaymentDetailMode
  );
  const setPaymentReason = useTransferRecipientInfoPageStore(
    (state) => state.setPaymentReason
  );
  const setManualPaymentDetail = useTransferRecipientInfoPageStore(
    (state) => state.setManualPaymentDetail
  );
  const [openSheet, setOpenSheet] = useState<RecipientSelectionSheet>(null);

  const renderClearButton = (onClear: () => void) => (
    <AppButton
      type="button"
      variant="unstyled"
      onClick={onClear}
      className="rounded-full bg-muted p-1 text-muted-foreground"
      aria-label="입력값 지우기"
    >
      <X className="h-4 w-4" />
    </AppButton>
  );

  const canProceed =
    recipientName.trim().length > 0 &&
    recipientDetailAddress.trim().length > 0 &&
    recipientCity.trim().length > 0 &&
    recipientPhoneNumber.trim().length > 0 &&
    swiftCode.trim().length > 0 &&
    accountNumber.trim().length > 0 &&
    routingNumber.trim().length > 0 &&
    bankBranchName.trim().length > 0 &&
    (paymentDetailMode === "reason-select"
      ? paymentReason.trim().length > 0
      : manualPaymentDetail.trim().length > 0);

  return (
    <>
      <MobileLayout
        title="해외송금"
        backPath="/transfer/send/step-04"
        bottomContent={
          <div className="flex w-full gap-4">
            <AppButton
              variant="outline"
              onClick={() => navigate("/transfer/send/step-04")}
              className="flex-1 rounded-xl px-6 py-4"
            >
              이전
            </AppButton>
            <AppButton
              variant="primary"
              disabled={!canProceed}
              onClick={() => navigate("/transfer/send/step-06")}
              className="flex-1 rounded-xl px-6 py-4"
            >
              다음
            </AppButton>
          </div>
        }
      >
        <div className="space-y-8 pb-4 pt-3">
          <section className="space-y-2">
            <h1 className="text-[24px] font-semibold leading-tight text-[#132347]">
              받는분 정보입력
            </h1>
          </section>

          <section className="space-y-6">
            <ClearableInput
              label="영문성명"
              value={recipientName}
              onChange={setRecipientName}
              trailing={
                recipientName
                  ? renderClearButton(() => setRecipientName(""))
                  : undefined
              }
            />

            <div className="space-y-2">
              <label className="block text-base text-foreground">
                영문주소
              </label>
            </div>

            <ClearableInput
              label="세부주소"
              value={recipientDetailAddress}
              onChange={setRecipientDetailAddress}
              trailing={
                recipientDetailAddress
                  ? renderClearButton(() => setRecipientDetailAddress(""))
                  : undefined
              }
            />

            <ClearableInput
              label="지역명(선택)"
              value={recipientDistrict}
              placeholder="선택"
              onChange={setRecipientDistrict}
              trailing={
                recipientDistrict
                  ? renderClearButton(() => setRecipientDistrict(""))
                  : undefined
              }
            />

            <ClearableInput
              label="도시명"
              value={recipientCity}
              onChange={setRecipientCity}
              trailing={
                recipientCity
                  ? renderClearButton(() => setRecipientCity(""))
                  : undefined
              }
            />

            <ClearableInput
              label="우편번호(선택)"
              value={recipientPostalCode}
              placeholder="선택"
              onChange={setRecipientPostalCode}
              trailing={
                recipientPostalCode
                  ? renderClearButton(() => setRecipientPostalCode(""))
                  : undefined
              }
            />

            <ClearableInput
              label="전화번호"
              value={recipientPhoneNumber}
              onChange={setRecipientPhoneNumber}
              inputMode="tel"
              trailing={
                recipientPhoneNumber
                  ? renderClearButton(() => setRecipientPhoneNumber(""))
                  : undefined
              }
            />
          </section>

          <section className="space-y-6">
            <h2 className="text-[20px] font-semibold leading-tight text-[#132347]">
              수취은행정보
            </h2>

            <ClearableInput
              label="SWIFT CODE"
              value={swiftCode}
              onChange={setSwiftCode}
              labelAction={
                <AppButton
                  type="button"
                  variant="unstyled"
                  onClick={() => navigate("/transfer/send/step-05/swift-code-lookup")}
                  className="flex items-center gap-1 text-base font-medium text-primary"
                >
                  SWIFT CODE 조회
                  <span aria-hidden="true">›</span>
                </AppButton>
              }
              trailing={
                swiftCode
                  ? renderClearButton(() => setSwiftCode(""))
                  : undefined
              }
            />

            <ClearableInput
              label="수취계좌번호"
              value={accountNumber}
              onChange={setAccountNumber}
              trailing={
                accountNumber
                  ? renderClearButton(() => setAccountNumber(""))
                  : undefined
              }
            />

            <ClearableInput
              label="수취은행코드(Routing No)"
              value={routingNumber}
              onChange={setRoutingNumber}
              placeholder="9자리 숫자 입력"
              inputMode="numeric"
            />

            <ClearableInput
              label="수취은행 영문명/지점명"
              value={bankBranchName}
              onChange={setBankBranchName}
            />
          </section>

          <section className="space-y-6">
            <div className="space-y-3">
              <label className="block text-base text-foreground">
                추가이체정보(DETAILS OF PAYMENT)
              </label>
              <SegmentedOptionField
                options={paymentDetailOptions}
                value={paymentDetailMode}
                onChange={setPaymentDetailMode}
              />
            </div>

            {paymentDetailMode === "reason-select" ? (
              <div className="space-y-2">
                <label className="block text-base text-foreground">
                  송금사유
                </label>
                <AppButton
                  type="button"
                  variant="unstyled"
                  onClick={() => setOpenSheet("payment-reason")}
                  className="mt-[6px] flex w-full items-center justify-between rounded-2xl border border-border bg-background px-5 py-5 text-left text-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <span
                    className={
                      paymentReason
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {paymentReason || "선택"}
                  </span>
                  <ChevronDown className="h-6 w-6 shrink-0 text-muted-foreground" />
                </AppButton>
              </div>
            ) : (
              <ClearableInput
                label="송금사유"
                value={manualPaymentDetail}
                onChange={setManualPaymentDetail}
                placeholder="송금사유를 입력해 주세요"
                multiline
              />
            )}
          </section>
        </div>
      </MobileLayout>

      <BottomSheet
        isOpen={openSheet === "payment-reason"}
        onClose={() => setOpenSheet(null)}
        title=""
        height="480px"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-2">
            <p className="text-lg font-semibold text-foreground">
              송금사유 선택
            </p>
            <AppButton
              type="button"
              variant="unstyled"
              onClick={() => setOpenSheet(null)}
              className="p-1 text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </AppButton>
          </div>
          <div className="divide-y divide-border rounded-2xl border border-border bg-background">
            {paymentReasonOptions.map((option) => (
              <AppButton
                key={option}
                type="button"
                variant="unstyled"
                onClick={() => {
                  setPaymentReason(option);
                  setOpenSheet(null);
                }}
                className="w-full px-4 py-4 text-left text-foreground transition-colors hover:bg-secondary"
              >
                {option}
              </AppButton>
            ))}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
