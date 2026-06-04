import { Filter, ChevronRight } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { AppButton } from "../../components/design-system/AppButton";
import { FilterBottomSheet } from "../../components/design-system/FilterBottomSheet";
import { useTransactionHistoryPageStore } from "../../stores/pageStores";

export function TransferHistory() {
  const isFilterOpen = useTransactionHistoryPageStore(
    (state) => state.isFilterOpen
  );
  const selectedPeriod = useTransactionHistoryPageStore(
    (state) => state.selectedPeriod
  );
  const selectedType = useTransactionHistoryPageStore(
    (state) => state.selectedType
  );
  const setFilterOpen = useTransactionHistoryPageStore(
    (state) => state.setFilterOpen
  );
  const setSelectedPeriod = useTransactionHistoryPageStore(
    (state) => state.setSelectedPeriod
  );
  const setSelectedType = useTransactionHistoryPageStore(
    (state) => state.setSelectedType
  );

  const transfers = [
    {
      id: 1,
      status: "완료",
      amount: "USD 350.00",
      date: "2026.05.14",
      description: "베트남 Nguyen An",
    },
    {
      id: 2,
      status: "처리중",
      amount: "USD 120.00",
      date: "2026.05.13",
      description: "필리핀 Maria Cruz",
    },
    {
      id: 3,
      status: "완료",
      amount: "JPY 45,000",
      date: "2026.05.11",
      description: "일본 Sato Kenji",
    },
  ];

  const handleApplyFilter = () => {
    setFilterOpen(false);
  };

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
                USD 515.00
              </h2>
            </div>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">완료 </span>
                <span className="text-blue-600">2건</span>
              </div>
              <div>
                <span className="text-muted-foreground">처리중 </span>
                <span className="text-foreground">1건</span>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>기간: {selectedPeriod}</span>
            <span>•</span>
            <span>상태: {selectedType}</span>
          </div>

          <section className="space-y-3">
            {transfers.map((transfer) => (
              <AppButton
                variant="unstyled"
                key={transfer.id}
                className="w-full rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:bg-secondary/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded bg-secondary px-2 py-0.5 text-xs">
                        {transfer.status}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {transfer.date}
                      </span>
                    </div>
                    <p className="mb-1 text-sm text-foreground">
                      {transfer.description}
                    </p>
                    <p className="font-medium text-foreground">
                      {transfer.amount}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </AppButton>
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
        onApply={handleApplyFilter}
      />
    </>
  );
}
