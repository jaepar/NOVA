import apiClient from "../client";

type BankingApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

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
  has_notification: boolean;
};

export const bankingApi = {
  getHome: async (): Promise<AccountHomeResponse> => {
    const response = await apiClient.get<
      BankingApiResponse<AccountHomeResponse>
    >("/banking/home");

    return response.data.data;
  },
};
