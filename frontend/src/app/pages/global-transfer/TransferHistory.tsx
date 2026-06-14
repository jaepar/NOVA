import { useEffect, useMemo, useState } from "react";
import { Filter, ChevronRight } from "lucide-react";
import { bankingApi, type GlobalTransferHistoryItem } from "../../../api";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { AppButton } from "../../components/design-system/AppButton";
import { FilterBottomSheet } from "../../components/design-system/FilterBottomSheet";
import { getTransferCountryName, transferCountries } from "../../data/transferCountries";
import { useTranslation } from "../../i18n";

type PeriodFilter = "ALL" | "ONE_MONTH" | "THREE_MONTHS" | "SIX_MONTHS";
type StatusFilter = "ALL" | "COMPLETED" | "PROCESSING" | "FAILED";

const PERIOD_MONTH_MAP: Partial<Record<PeriodFilter, number>> = {
  ONE_MONTH: 1,
  THREE_MONTHS: 3,
  SIX_MONTHS: 6,
};

const countryMap = new Map(transferCountries.map((country) => [country.id.toLowerCase(), country]));

function getStatusGroup(status: string): Exclude<StatusFilter, "ALL"> {
  if (["SUCCESS", "COMPLETED", "COMPLETE"].includes(status)) return "COMPLETED";
  if (["FAILED", "REJECTED", "CANCELED", "CANCELLED"].includes(status)) return "FAILED";
  return "PROCESSING";
}

function isCompletedStatus(status: string) {
  return getStatusGroup(status) === "COMPLETED";
}

function getStatusLabelKey(status: string) {
  const group = getStatusGroup(status);
  if (group === "COMPLETED") return "globalTransfer.history.completed";
  if (group === "FAILED") return "globalTransfer.history.failed";
  return "globalTransfer.history.processing";
}

function formatDate(value: string | null, language: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(language === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getCountryName(targetCountry: string | null, fallback: string, language: string) {
  if (!targetCountry) return fallback;
  const country = countryMap.get(targetCountry.toLowerCase());
  return country ? getTransferCountryName(country, language) : targetCountry;
}

function isWithinPeriod(item: GlobalTransferHistoryItem, selectedPeriod: PeriodFilter) {
  if (selectedPeriod === "ALL") return true;
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

function formatTotal(items: GlobalTransferHistoryItem[], countUnit: string) {
  const totals = items.reduce<Record<string, number>>((acc, item) => {
    const amount = Number(item.remitAmount);
    if (Number.isNaN(amount)) return acc;

    acc[item.currency] = (acc[item.currency] ?? 0) + amount;
    return acc;
  }, {});

  const entries = Object.entries(totals);
  if (entries.length === 0) return `0${countUnit}`;
  if (entries.length > 1) return `${items.length}${countUnit}`;

  const [currency, amount] = entries[0];
  return `${currency} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function TransferHistory() {
  const { t, language } = useTranslation();
  const [transfers, setTransfers] = useState<GlobalTransferHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("ALL");
  const [selectedType, setSelectedType] = useState<StatusFilter>("ALL");

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
          setErrorMessage(t("globalTransfer.history.loadError"));
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
  }, [t]);

  const periodFilteredTransfers = useMemo(
    () => transfers.filter((transfer) => isWithinPeriod(transfer, selectedPeriod)),
    [selectedPeriod, transfers]
  );

  const filteredTransfers = useMemo(() => {
    if (selectedType === "ALL") return periodFilteredTransfers;
    return periodFilteredTransfers.filter(
      (transfer) => getStatusGroup(transfer.status) === selectedType
    );
  }, [periodFilteredTransfers, selectedType]);

  const { completedCount, processingCount } = useMemo(() => {
    let completed = 0;
    let processing = 0;
    for (const transfer of periodFilteredTransfers) {
      const group = getStatusGroup(transfer.status);
      if (group === "COMPLETED") completed++;
      else if (group === "PROCESSING") processing++;
    }
    return { completedCount: completed, processingCount: processing };
  }, [periodFilteredTransfers]);

  const periodLabels: Record<PeriodFilter, string> = {
    ALL: t("globalTransfer.history.periodAll"),
    ONE_MONTH: t("globalTransfer.history.period1Month"),
    THREE_MONTHS: t("globalTransfer.history.period3Months"),
    SIX_MONTHS: t("globalTransfer.history.period6Months"),
  };
  const statusLabels: Record<StatusFilter, string> = {
    ALL: t("globalTransfer.history.all"),
    COMPLETED: t("globalTransfer.history.completed"),
    PROCESSING: t("globalTransfer.history.processing"),
    FAILED: t("globalTransfer.history.failed"),
  };
  const showEmptyState = !isLoading && !errorMessage && filteredTransfers.length === 0;
  const countUnit = t("globalTransfer.history.countUnit");

  return (
    <>
      <MobileLayout
        title={t("globalTransfer.history.title")}
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
                {t("globalTransfer.history.recentTotal")}
              </span>
              <h2 className="text-lg font-semibold text-foreground">
                {formatTotal(filteredTransfers, countUnit)}
              </h2>
            </div>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  {t("globalTransfer.history.completed")}{" "}
                </span>
                <span className="text-blue-600">
                  {completedCount}
                  {countUnit}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("globalTransfer.history.processing")}{" "}
                </span>
                <span className="text-foreground">
                  {processingCount}
                  {countUnit}
                </span>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {t("globalTransfer.history.periodLabel")}: {periodLabels[selectedPeriod]}
            </span>
            <span>/</span>
            <span>
              {t("globalTransfer.history.statusLabel")}: {statusLabels[selectedType]}
            </span>
          </div>

          <section className="space-y-3">
            {isLoading && (
              <div className="rounded-2xl bg-secondary px-5 py-12 text-center text-sm text-muted-foreground">
                {t("globalTransfer.history.loading")}
              </div>
            )}

            {!isLoading && errorMessage && (
              <div className="rounded-2xl bg-destructive/10 px-5 py-5 text-sm font-medium text-destructive">
                {errorMessage}
              </div>
            )}

            {showEmptyState && (
              <div className="rounded-2xl bg-secondary px-5 py-12 text-center text-sm text-muted-foreground">
                {t("globalTransfer.history.empty")}
              </div>
            )}

            {!isLoading &&
              !errorMessage &&
              filteredTransfers.map((transfer) => (
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
                          {t(getStatusLabelKey(transfer.status))}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(transfer.createdAt, language)}
                        </span>
                      </div>
                      <p className="mb-1 text-sm text-foreground">
                        {getCountryName(
                          transfer.targetCountry,
                          t("globalTransfer.history.unknownCountry"),
                          language
                        )}{" "}
                        {transfer.receiverEngName}
                      </p>
                      <p className="font-medium text-foreground">{formatAmount(transfer)}</p>
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
            title: t("globalTransfer.history.periodFilterTitle"),
            options: [
              { value: "ALL", label: periodLabels.ALL },
              { value: "ONE_MONTH", label: periodLabels.ONE_MONTH },
              { value: "THREE_MONTHS", label: periodLabels.THREE_MONTHS },
              { value: "SIX_MONTHS", label: periodLabels.SIX_MONTHS },
            ],
            selectedValue: selectedPeriod,
            onSelect: (value) => setSelectedPeriod(value as PeriodFilter),
          },
          {
            title: t("globalTransfer.history.statusFilterTitle"),
            options: [
              { value: "ALL", label: statusLabels.ALL },
              { value: "COMPLETED", label: statusLabels.COMPLETED },
              { value: "PROCESSING", label: statusLabels.PROCESSING },
              { value: "FAILED", label: statusLabels.FAILED },
            ],
            selectedValue: selectedType,
            onSelect: (value) => setSelectedType(value as StatusFilter),
          },
        ]}
        onApply={() => setFilterOpen(false)}
      />
    </>
  );
}
