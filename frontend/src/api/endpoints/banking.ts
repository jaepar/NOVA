import apiClient from "../client";

type BankingApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

export type CertificateStatus = "NOT_ISSUED" | "PENDING" | "ISSUED";

export type AccountHomeUiState =
  | "NEED_CERTIFICATE"
  | "CERTIFICATE_ISSUING"
  | "READY_TO_OPEN_ACCOUNT"
  | "HAS_ACCOUNT";

export type AccountSummary = {
  accountId: number;
  accountName: string;
  accountNumber: string;
  bankName: string;
  balance: number;
  hasLimit: boolean;
};

export type AccountHomeResponse = {
  uiState: AccountHomeUiState;
  account: AccountSummary | null;
  has_notification?: boolean;
};

export type TransactionPeriod = "ONE_WEEK" | "ONE_MONTH" | "CUSTOM";
export type TransactionFlowFilter = "ALL" | "DEPOSIT" | "WITHDRAWAL";
export type TransactionSortDirection = "ASC" | "DESC";
export type TransactionType =
  | "SMART_WITHDRAWAL"
  | "CASH_IC"
  | "CHECK_CARD"
  | "ACCOUNT_TRANSFER"
  | "ATM_WITHDRAWAL"
  | "ATM_DEPOSIT"
  | "AUTO_DEBIT"
  | "WALLET_CHARGE"
  | "FEE"
  | "GLOBAL_REMITTANCE"
  | "GLOBAL_REMITTANCE_REFUND";

export type GetTransactionsParams = {
  period?: TransactionPeriod;
  flow?: TransactionFlowFilter;
  from?: string;
  to?: string;
  keyword?: string;
  sortDirection?: TransactionSortDirection;
  page?: number;
  size?: number;
};

export type BankingTransaction = {
  transactionId: number;
  transactionFlow: TransactionFlowFilter;
  transactionType: TransactionType;
  counterParty: string;
  amount: number;
  balanceAfter: number;
  memo: string | null;
  transactionDateTime: string;
};

export type BankingTransactionsResponse = {
  accountId: number;
  period: TransactionPeriod;
  flow: TransactionFlowFilter;
  transactions: BankingTransaction[];
  page: number;
  size: number;
  hasNext: boolean;
};

export type UpdateTransactionMemoRequest = {
  memo: string | null;
};

export const bankingApi = {
  getHome: async (): Promise<AccountHomeResponse> => {
    const response = await apiClient.get<
      BankingApiResponse<AccountHomeResponse>
    >("/banking/home");

    return response.data.data;
  },
  getTransactions: async (
    accountId: number,
    params: GetTransactionsParams = {}
  ): Promise<BankingTransactionsResponse> => {
    const response = await apiClient.get<
      BankingApiResponse<BankingTransactionsResponse>
    >(`/banking/${accountId}/transactions`, {
      params,
    });

    return response.data.data;
  },
  updateTransactionMemo: async (
    transactionId: number,
    request: UpdateTransactionMemoRequest
  ): Promise<void> => {
    await apiClient.patch<BankingApiResponse<null>>(
      `/banking/transactions/${transactionId}/memo`,
      request
    );
  },
};
