import type { WalletTransactionResponse } from "../../../../api";
import type { WalletTransaction } from "../data/walletTransactionTypes";

function formatTransactionDate(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return {
      month: "",
      date: "",
      time: "",
    };
  }

  return {
    month: `${date.getFullYear()}년 ${date.getMonth() + 1}월`,
    date: `${date.getMonth() + 1}월 ${date.getDate()}일`,
    time: date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
  };
}

export function toWalletTransaction(
  transaction: WalletTransactionResponse,
): WalletTransaction {
  const formattedDate = formatTransactionDate(transaction.createdAt);
  const amount = Math.abs(transaction.amount);

  return {
    id: String(transaction.walletTransactionId),
    transactionFlow: transaction.transactionFlow,
    month: formattedDate.month,
    date: formattedDate.date,
    time: formattedDate.time,
    title: transaction.counterparty,
    amount: transaction.transactionFlow === "DEPOSIT" ? amount : -amount,
  };
}
