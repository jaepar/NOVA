import apiClient from "../client";
import { extractApiErrorBody } from "../utils";

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

export type TransferPreviewRequest = {
  recipientBankCode: string;
  recipientAccountNumber: string;
};

export type TransferRequest = {
  withdrawAccountId: string;
  depositAccountId: string;
  transferAmount: number;
  accountPassword: string;
};

export type TransferPreviewResponse = {
  myAccount: {
    accountName: string;
    accountNumber: string;
    balance: number;
    transferLimit: number;
    userName: string;
  };
  recipient: {
    recipientName: string;
  };
};

export type BankingApiErrorBody = {
  success: false;
  code: string;
  message: string;
  data: null;
};

const DEV_ACCOUNT_HOME_MOCKS = {
  needCertificate: {
    hasAccount: false,
    certificateStatus: "NOT_ISSUED",
    uiState: "NEED_CERTIFICATE",
    account: null,
  } satisfies AccountHomeResponse,
  certificateIssuing: {
    hasAccount: false,
    certificateStatus: "PENDING",
    uiState: "CERTIFICATE_ISSUING",
    account: null,
  } satisfies AccountHomeResponse,
  readyToOpenAccount: {
    hasAccount: false,
    certificateStatus: "ISSUED",
    uiState: "READY_TO_OPEN_ACCOUNT",
    account: null,
  } satisfies AccountHomeResponse,
  hasLimitedAccount: {
    hasAccount: true,
    certificateStatus: "ISSUED",
    uiState: "HAS_ACCOUNT",
    account: {
      accountName: "NOVA 입출금통장",
      accountNumber: "1080-312-345678",
      bankName: "우리은행",
      balance: 150000,
      hasLimit: true,
    },
  } satisfies AccountHomeResponse,
  hasGeneralAccount: {
    hasAccount: true,
    certificateStatus: "ISSUED",
    uiState: "HAS_ACCOUNT",
    account: {
      accountName: "NOVA 생활통장",
      accountNumber: "1080-999-123456",
      bankName: "우리은행",
      balance: 2840000,
      hasLimit: false,
    },
  } satisfies AccountHomeResponse,
} as const;

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
  previewTransfer: async (
    request: TransferPreviewRequest
  ): Promise<TransferPreviewResponse> => {
    const response = await apiClient.post<
      BankingApiResponse<TransferPreviewResponse>
    >(
      "/banking/transfers/preview",
      request
    );

    return response.data.data;
  },
  transfer: async (request: TransferRequest, idempotencyKey: string): Promise<void> => {
    const response = await apiClient.post<BankingApiResponse<null>>(
      "/banking/transfers",
      request,
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }
    );

    if (!response.data.success) {
      throw response.data;
    }
  },
};

export function getBankingApiError(error: unknown): BankingApiErrorBody | null {
  return extractApiErrorBody<BankingApiErrorBody>(error);
}
