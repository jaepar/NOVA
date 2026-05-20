import { MobileLayout } from '../components/layout/MobileLayout';
import { AppButton } from '../components/design-system/AppButton';
import { FilterBottomSheet } from '../components/design-system/FilterBottomSheet';
import { Filter, ChevronRight } from 'lucide-react';
import { useTransactionHistoryPageStore } from '../stores/pageStores';

export function TransactionHistory() {
  const isFilterOpen = useTransactionHistoryPageStore((state) => state.isFilterOpen);
  const selectedPeriod = useTransactionHistoryPageStore((state) => state.selectedPeriod);
  const selectedType = useTransactionHistoryPageStore((state) => state.selectedType);
  const setFilterOpen = useTransactionHistoryPageStore((state) => state.setFilterOpen);
  const setSelectedPeriod = useTransactionHistoryPageStore((state) => state.setSelectedPeriod);
  const setSelectedType = useTransactionHistoryPageStore((state) => state.setSelectedType);

  const transactions = [
    { id: 1, type: '입금', amount: '+500,000원', date: '2026.05.14', description: '급여 입금' },
    { id: 2, type: '출금', amount: '-50,000원', date: '2026.05.13', description: 'ATM 출금' },
    { id: 3, type: '송금', amount: '-100,000원', date: '2026.05.12', description: '김철수님께 송금' },
    { id: 4, type: '환전', amount: '-200,000원', date: '2026.05.11', description: 'USD 환전' },
    { id: 5, type: '입금', amount: '+30,000원', date: '2026.05.10', description: '이체 입금' },
  ];

  const handleApplyFilter = () => {
    setFilterOpen(false);
    // 필터 적용 로직
  };

  return (
    <>
      <MobileLayout
        title="거래내역 조회"
        headerRightContent={
            <AppButton
              variant="unstyled"
              onClick={() => setFilterOpen(true)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <Filter className="w-5 h-5" />
          </AppButton>
        }
      >
        <div className="space-y-6 ">
          {/* Summary Section */}
          <section className="bg-secondary p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">현재 잔액</span>
              <h2>1,250,000원</h2>
            </div>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">입금 </span>
                <span className="text-blue-600">+530,000원</span>
              </div>
              <div>
                <span className="text-muted-foreground">출금 </span>
                <span className="text-red-600">-350,000원</span>
              </div>
            </div>
          </section>

          {/* Filter Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>기간: {selectedPeriod}</span>
            <span>•</span>
            <span>유형: {selectedType}</span>
          </div>

          {/* Transaction List */}
          <section className="space-y-3">
            {transactions.map((transaction) => (
              <AppButton
                variant="unstyled"
                key={transaction.id}
                className="w-full p-4 bg-background border border-border rounded-xl hover:bg-secondary transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-secondary rounded">
                        {transaction.type}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {transaction.date}
                      </span>
                    </div>
                    <p className="mb-1">{transaction.description}</p>
                    <p className={`font-medium ${
                      transaction.amount.startsWith('+') ? 'text-blue-600' : 'text-foreground'
                    }`}>
                      {transaction.amount}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </AppButton>
            ))}
          </section>
        </div>
      </MobileLayout>

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setFilterOpen(false)}
        sections={[
          {
            title: '조회 기간',
            options: [
              { value: '전체', label: '전체' },
              { value: '1개월', label: '1개월' },
              { value: '3개월', label: '3개월' },
              { value: '6개월', label: '6개월' },
            ],
            selectedValue: selectedPeriod,
            onSelect: setSelectedPeriod,
          },
          {
            title: '거래 유형',
            options: [
              { value: '전체', label: '전체' },
              { value: '입금', label: '입금' },
              { value: '출금', label: '출금' },
              { value: '송금', label: '송금' },
              { value: '환전', label: '환전' },
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
