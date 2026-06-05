import type { RouteObject } from "react-router-dom";
import { TransactionHistory } from "../pages/TransactionHistory";
import { TransactionHistoryDetail } from "../pages/TransactionHistoryDetail";

export const transactionHistoryRoutes: RouteObject[] = [
  { path: "/transaction-history", Component: TransactionHistory },
  { path: "/transaction-history/:transactionId", Component: TransactionHistoryDetail },
];
