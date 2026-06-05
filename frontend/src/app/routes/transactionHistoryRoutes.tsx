import type { RouteObject } from "react-router-dom";
import { TransactionHistoryPage } from "../pages/transaction-history/TransactionHistoryPage";
import { TransactionHistoryDetailPage } from "../pages/transaction-history/TransactionHistoryDetailPage";

export const transactionHistoryRoutes: RouteObject[] = [
  { path: "/transaction-history", Component: TransactionHistoryPage },
  { path: "/transaction-history/:transactionId", Component: TransactionHistoryDetailPage },
];
