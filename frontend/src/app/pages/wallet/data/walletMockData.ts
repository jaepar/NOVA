export type WalletTransaction = {
  id: string;
  month: string;
  date: string;
  time: string;
  title: string;
  amount: number;
};

export type WalletTransactionFilter = "all" | "charge" | "use";

export const walletBalance = 3220000;

export const walletTransactions: WalletTransaction[] = [
  {
    id: "tx-20260110",
    month: "2026년 1월",
    date: "1월 10일",
    time: "20:09:41",
    title: "월렛 충전",
    amount: 20000,
  },
  {
    id: "tx-20260109",
    month: "2026년 1월",
    date: "1월 9일",
    time: "11:02:29",
    title: "스타벅스 강남역점",
    amount: -30000,
  },
  {
    id: "tx-20260107",
    month: "2026년 1월",
    date: "1월 7일",
    time: "12:00:32",
    title: "파리바게뜨 역삼점",
    amount: -30000,
  },
  {
    id: "tx-20260106",
    month: "2026년 1월",
    date: "1월 6일",
    time: "15:30:11",
    title: "월렛 충전",
    amount: 10000,
  },
  {
    id: "tx-20260105",
    month: "2026년 1월",
    date: "1월 5일",
    time: "09:15:07",
    title: "신분당선 강남역",
    amount: -2600,
  },
  {
    id: "tx-20260103",
    month: "2026년 1월",
    date: "1월 3일",
    time: "16:45:23",
    title: "CU 역삼센터점",
    amount: -15000,
  },
];

export const walletTransactionFilterLabels: Record<WalletTransactionFilter, string> = {
  all: "전체",
  charge: "충전",
  use: "사용",
};
