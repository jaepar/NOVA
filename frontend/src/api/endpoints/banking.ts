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
  hasNotification: boolean;
};

type AccountHomeApiResponse = Omit<AccountHomeResponse, "hasNotification"> & {
  has_notification: boolean;
};

function normalizeAccountHome(
  response: AccountHomeApiResponse
): AccountHomeResponse {
  return {
    uiState: response.uiState,
    account: response.account,
    hasNotification: response.has_notification,
  };
}

export const bankingApi = {
  getHome: async (): Promise<AccountHomeResponse> => {
    const response = await apiClient.get<
      BankingApiResponse<AccountHomeApiResponse>
    >("/banking/home");

    return normalizeAccountHome(response.data.data);
  },
};
