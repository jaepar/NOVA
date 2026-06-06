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

const DEV_ACCOUNT_HOME_MOCKS = {
  needCertificate: {
    uiState: "NEED_CERTIFICATE",
    account: null,
    has_notification: false,
  } satisfies AccountHomeResponse,
  certificateIssuing: {
    uiState: "CERTIFICATE_ISSUING",
    account: null,
    has_notification: true,
  } satisfies AccountHomeResponse,
  readyToOpenAccount: {
    uiState: "READY_TO_OPEN_ACCOUNT",
    account: null,
    has_notification: false,
  } satisfies AccountHomeResponse,
  hasLimitedAccount: {
    uiState: "HAS_ACCOUNT",
    account: {
      accountId: 1,
      accountName: "NOVA Account",
      accountNumber: "1080-312-345678",
      bankName: "Woori Bank",
      balance: 150000,
      hasLimit: true,
    },
    has_notification: true,
  } satisfies AccountHomeResponse,
  hasGeneralAccount: {
    uiState: "HAS_ACCOUNT",
    account: {
      accountId: 2,
      accountName: "NOVA Living Account",
      accountNumber: "1080-999-123456",
      bankName: "Woori Bank",
      balance: 2840000,
      hasLimit: false,
    },
    has_notification: false,
  } satisfies AccountHomeResponse,
} as const;

const DEV_MOCK_ACCOUNT_HOME_RESPONSE: AccountHomeResponse =
  DEV_ACCOUNT_HOME_MOCKS.hasGeneralAccount;

function getDevAccountHome(): AccountHomeResponse {
  return DEV_MOCK_ACCOUNT_HOME_RESPONSE;
}

export const bankingApi = {
  getHome: async (): Promise<AccountHomeResponse> => {
    if (import.meta.env.VITE_USE_BANKING_HOME_MOCK === "true") {
      return getDevAccountHome();
    }

    const response = await apiClient.get<
      BankingApiResponse<AccountHomeResponse>
    >("/banking/home");

    return response.data.data;
  },
};
