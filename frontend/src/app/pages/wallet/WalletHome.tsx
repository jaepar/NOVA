import { ChevronDown, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppButton } from "../../components/design-system/AppButton";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { WalletBalanceCard } from "./components/WalletBalanceCard";
import { WalletTransactionItem } from "./components/WalletTransactionItem";
import { walletBalance, walletTransactions } from "./data/walletMockData";

export function WalletHome() {
  const navigate = useNavigate();

  return (
    <MobileLayout title="월렛">
      <div className="space-y-6 pt-6">
        <WalletBalanceCard balance={walletBalance} />

        <div className="grid grid-cols-2 gap-3">
          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => navigate("/wallet/charge")}
            className="flex h-13 items-center justify-center gap-2 rounded-lg bg-[#014ede] text-[16px] text-white transition-colors hover:bg-[#0142bd]"
          >
            충전
          </AppButton>
          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => navigate("/wallet/payment")}
            className="flex h-13 items-center justify-center rounded-lg border border-[#e0e0e0] bg-background text-[16px] text-foreground transition-colors hover:bg-blue-50"
          >
            결제
          </AppButton>
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[19px] font-semibold leading-8 text-foreground">
              이용 내역
            </h2>
            <AppButton
              type="button"
              variant="unstyled"
              className="flex items-center gap-1 text-[16px] font-medium text-foreground"
            >
              전체
              <ChevronDown className="h-5 w-5" />
            </AppButton>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-background">
            {walletTransactions.map((transaction, index) => (
              <WalletTransactionItem
                key={transaction.id}
                transaction={transaction}
                showMonth={index === 0 || index === 3}
                isLast={index === walletTransactions.length - 1}
              />
            ))}
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}
