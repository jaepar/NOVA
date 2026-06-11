import { useEffect, useMemo, useState } from "react";
import { Filter, ChevronRight } from "lucide-react";
import { bankingApi, type GlobalTransferHistoryItem } from "../../../api";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { AppButton } from "../../components/design-system/AppButton";
import { FilterBottomSheet } from "../../components/design-system/FilterBottomSheet";
import { transferCountries } from "../../data/transferCountries";

const statusLabels: Record<string, string> = {
  PENDING: "처리중",
  PROCESSING: "처리중",
  SUCCESS: "완료",
  COMPLETED: "완료",
  COMPLETE: "완료",
  FAILED: "실패",
  REJECTED: "실패",
  CANCELED: "실패",
  CANCELLED: "실패",
};

const PERIOD_MONTH_MAP: Record<string, number> = {
  "1개월": 1,
  "3개월": 3,
  "6개월": 6,
};

const countryNameMap = new Map(
  transferCountries.map((c) => [c.id.toLowerCase(), c.name])
);

function formatDate(value: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getStatusLabel(status: string) {
  return statusLabels[status] ?? status;
}

function isCompletedStatus(status: string) {
  return ["SUCCESS", "COMPLETED", "COMPLETE"].includes(status);
}

function getCountryName(targetCountry: string | null) {
  if (!targetCountry) return "국가 미확인";
  return countryNameMap.get(targetCountry.toLowerCase()) ?? targetCountry;
}

function isWithinPeriod(item: GlobalTransferHistoryItem, selectedPeriod: string) {
  if (selectedPeriod === "전체") return true;
  if (!item.createdAt) return false;

  const createdAt = new Date(item.createdAt);
  if (Number.isNaN(createdAt.getTime())) return false;

  const months = PERIOD_MONTH_MAP[selectedPeriod];
  if (!months) return true;

  const start = new Date();
  start.setMonth(start.getMonth() - months);
  return createdAt >= start;
}

function formatAmount(item: GlobalTransferHistoryItem) {
  return `${item.currency} ${item.remitAmount}`;
}

function formatTotal(items: GlobalTransferHistoryItem[]) {
  const totals = items.reduce<Record<string, number>>((acc, item) => {
    const amount = Number(item.remitAmount);
    if (Number.isNaN(amount)) return acc;

    acc[item.currency] = (acc[item.currency] ?? 0) + amount;
    return acc;
  }, {});

  const entries = Object.entries(totals);
  if (entries.length === 0) return "0건";
  if (entries.length > 1) return `${items.length}건`;

  const [currency, amount] = entries[0];
  return `${currency} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function TransferHistory() {
  const [transfers, setTransfers] = useState<GlobalTransferHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("전체");
  const [selectedType, setSelectedType] = useState("전체");

  useEffect(() => {
    let isMounted = true;

    async function loadTransfers() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await bankingApi.getGlobalTransferHistory();
        if (isMounted) {
          setTransfers(response);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("송금 내역을 불러오지 못했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadTransfers();

    return () => {
      isMounted = false;
    };
  }, []);

  const periodFilteredTransfers = useMemo(
    () => transfers.filter((transfer) => isWithinPeriod(transfer, selectedPeriod)),
    [selectedPeriod, transfers]
  );

  const filteredTransfers = useMemo(() => {
    if (selectedType === "전체") return periodFilteredTransfers;
    return periodFilteredTransfers.filter(
      (transfer) => getStatusLabel(transfer.status) === selectedType
    );
  }, [periodFilteredTransfers, selectedType]);

  const { completedCount, processingCount } = useMemo(() => {
    let completed = 0;
    let processing = 0;
    for (const t of periodFilteredTransfers) {
      const label = getStatusLabel(t.status);
      if (label === "완료") completed++;
      else if (label === "처리중") processing++;
    }
    return { completedCount: completed, processingCount: processing };
  }, [periodFilteredTransfers]);

  const showEmptyState = !isLoading && !errorMessage && filteredTransfers.length === 0;

  return (
    <>
      <MobileLayout
        title="송금 내역 조회"
        headerType="back"
        backPath="/global-transfer"
        headerRightContent={
          <AppButton
            variant="unstyled"
            onClick={() => setFilterOpen(true)}
            className="rounded-lg p-2 transition-colors hover:bg-secondary"
          >
            <Filter className="h-5 w-5" />
          </AppButton>
        }
      >
        <div className="space-y-6 pt-3">
          <section className="rounded-2xl bg-secondary p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                최근 송금 합계
              </span>
              <h2 className="text-lg font-semibold text-foreground">
                {formatTotal(filteredTransfers)}
              </h2>
            </div>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">완료 </span>
                <span className="text-blue-600">{completedCount}건</span>
              </div>
              <div>
                <span className="text-muted-foreground">처리중 </span>
                <span className="text-foreground">{processingCount}건</span>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>기간: {selectedPeriod}</span>
            <span>•</span>
            <span>상태: {selectedType}</span>
          </div>

          <section className="space-y-3">
            {isLoading && (
              <div className="rounded-2xl bg-secondary px-5 py-12 text-center text-sm text-muted-foreground">
                송금 내역을 불러오는 중입니다.
              </div>
            )}

            {!isLoading && errorMessage && (
              <div className="rounded-2xl bg-destructive/10 px-5 py-5 text-sm font-medium text-destructive">
                {errorMessage}
              </div>
            )}

            {showEmptyState && (
              <div className="rounded-2xl bg-secondary px-5 py-12 text-center text-sm text-muted-foreground">
                조회된 송금 내역이 없습니다.
              </div>
            )}

            {!isLoading && !errorMessage && filteredTransfers.map((transfer) => (
              <div
                key={transfer.globalTransactionId}
                className="w-full rounded-2xl border border-border bg-background p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          isCompletedStatus(transfer.status)
                            ? "bg-blue-50 text-blue-600"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        {getStatusLabel(transfer.status)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(transfer.createdAt)}
                      </span>
                    </div>
                    <p className="mb-1 text-sm text-foreground">
                      {getCountryName(transfer.targetCountry)} {transfer.receiverEngName}
                    </p>
                    <p className="font-medium text-foreground">
                      {formatAmount(transfer)}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </section>
        </div>
      </MobileLayout>

      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setFilterOpen(false)}
        sections={[
          {
            title: "조회 기간",
            options: [
              { value: "전체", label: "전체" },
              { value: "1개월", label: "1개월" },
              { value: "3개월", label: "3개월" },
              { value: "6개월", label: "6개월" },
            ],
            selectedValue: selectedPeriod,
            onSelect: setSelectedPeriod,
          },
          {
            title: "송금 상태",
            options: [
              { value: "전체", label: "전체" },
              { value: "완료", label: "완료" },
              { value: "처리중", label: "처리중" },
              { value: "실패", label: "실패" },
            ],
            selectedValue: selectedType,
            onSelect: setSelectedType,
          },
        ]}
        onApply={() => setFilterOpen(false)}
      />
    </>
  );
}
