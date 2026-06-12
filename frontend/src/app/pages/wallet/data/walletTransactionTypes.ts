import type { WalletTransactionFlow } from "../../../../api";

export type WalletTransaction = {
  id: string;
  transactionFlow: WalletTransactionFlow;
  month: string;
  date: string;
  time: string;
  title: string;
  amount: number;
};

export type WalletTransactionFilter = "all" | "charge" | "use";

export const walletTransactionFilterLabels: Record<WalletTransactionFilter, string> = {
  all: "전체",
  charge: "충전",
  use: "사용",
};
