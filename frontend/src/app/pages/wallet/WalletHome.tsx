import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppButton } from "../../components/design-system/AppButton";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { WalletBalanceCard } from "./components/WalletBalanceCard";
import { WalletTransactionItem } from "./components/WalletTransactionItem";
import {
  walletBalance,
  walletTransactionFilterLabels,
  walletTransactions,
  type WalletTransactionFilter,
} from "./data/walletMockData";
import { walletSecondaryButtonClass } from "./styles";
import { useWalletStore } from "./stores/walletStore";

const filterOptions: WalletTransactionFilter[] = ["all", "charge", "use"];
const TRANSACTION_PAGE_SIZE = 8;

export function WalletHome() {
  const navigate = useNavigate();
  const selectedFilter = useWalletStore((state) => state.selectedFilter);
  const filterOpen = useWalletStore((state) => state.filterOpen);
  const setSelectedFilter = useWalletStore((state) => state.setSelectedFilter);
  const setFilterOpen = useWalletStore((state) => state.setFilterOpen);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(TRANSACTION_PAGE_SIZE);

  const filteredTransactions = useMemo(() => {
    if (selectedFilter === "charge") {
      return walletTransactions.filter((transaction) => transaction.amount > 0);
    }

    if (selectedFilter === "use") {
      return walletTransactions.filter((transaction) => transaction.amount < 0);
    }

    return walletTransactions;
  }, [selectedFilter]);

  const visibleTransactions = useMemo(
    () => filteredTransactions.slice(0, visibleCount),
    [filteredTransactions, visibleCount],
  );

  const hasMoreTransactions = visibleCount < filteredTransactions.length;

  useEffect(() => {
    setVisibleCount(TRANSACTION_PAGE_SIZE);
  }, [selectedFilter]);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasMoreTransactions) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) =>
            Math.min(count + TRANSACTION_PAGE_SIZE, filteredTransactions.length),
          );
        }
      },
      { rootMargin: "120px 0px" },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [filteredTransactions.length, hasMoreTransactions]);

  return (
    <MobileLayout title="월렛">
      <div className="space-y-6 pt-6">
        <WalletBalanceCard balance={walletBalance} />

        <div className="grid grid-cols-2 gap-3">
          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => navigate("/wallet/charge")}
            className="flex h-[48px] w-full items-center justify-center rounded-lg bg-[#014ede] text-[14px] font-semibold text-white transition-colors hover:bg-[#0142bd] disabled:opacity-40"
          >
            충전
          </AppButton>
          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => navigate("/wallet/payment")}
            className={walletSecondaryButtonClass}
          >
            결제
          </AppButton>
        </div>

        <section>
          <div className="relative mb-4 flex items-center justify-between">
            <h2 className="text-[19px] font-semibold leading-8 text-foreground">
              이용 내역
            </h2>
            <div className="relative flex justify-end">
              <AppButton
                type="button"
                variant="unstyled"
                onClick={() => setFilterOpen((open) => !open)}
                className="flex min-w-[68px] items-center justify-end gap-1 text-[16px] font-medium text-foreground"
              >
                {walletTransactionFilterLabels[selectedFilter]}
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    filterOpen ? "rotate-180" : ""
                  }`}
                />
              </AppButton>

              {filterOpen && (
                <div className="absolute right-0 top-8 z-20 w-32 overflow-hidden rounded-xl border border-border bg-background p-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
                  {filterOptions.map((option) => (
                    <AppButton
                      key={option}
                      type="button"
                      variant="unstyled"
                      onClick={() => {
                        setSelectedFilter(option);
                        setFilterOpen(false);
                      }}
                      className={`block w-full rounded-lg px-4 py-3 text-left text-sm transition-colors ${
                        selectedFilter === option
                          ? "bg-blue-50 font-semibold text-[#014ede]"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      {walletTransactionFilterLabels[option]}
                    </AppButton>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-background">
            {visibleTransactions.length > 0 ? (
              visibleTransactions.map((transaction, index) => (
                <WalletTransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  showMonth={
                    index === 0 ||
                    visibleTransactions[index - 1].month !== transaction.month
                  }
                  isLast={index === visibleTransactions.length - 1 && !hasMoreTransactions}
                />
              ))
            ) : (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                표시할 이용 내역이 없습니다.
              </p>
            )}
          </div>

          {visibleTransactions.length > 0 && (
            <div
              ref={loadMoreRef}
              className="flex h-12 items-center justify-center text-sm text-muted-foreground"
            >
              {hasMoreTransactions ? "불러오는 중" : "마지막 내역입니다"}
            </div>
          )}
        </section>
      </div>
    </MobileLayout>
  );
}
