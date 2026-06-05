import apiClient from "../client";
import { AxiosError } from "axios";

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
  accountName: string;
  accountNumber: string;
  bankName: string;
  balance: number;
  hasLimit: boolean;
};

export type AccountHomeResponse = {
  hasAccount: boolean;
  certificateStatus: CertificateStatus;
  uiState: AccountHomeUiState;
  account: AccountSummary | null;
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

// 여기의 preset만 바꿔서 메인 화면 렌더링을 테스트하면 됩니다.
// 예: DEV_ACCOUNT_HOME_MOCKS.certificateIssuing
const DEV_MOCK_ACCOUNT_HOME_RESPONSE: AccountHomeResponse =
  DEV_ACCOUNT_HOME_MOCKS.hasGeneralAccount;

function getDevAccountHome(): AccountHomeResponse {
  return DEV_MOCK_ACCOUNT_HOME_RESPONSE;
}

export function getBankingApiError(error: unknown): BankingApiErrorBody | null {
  if (!(error instanceof AxiosError)) {
    if (!error || typeof error !== "object") return null;

    const errorBody = error as Partial<BankingApiErrorBody>;
    if (
      typeof errorBody.code !== "string" ||
      typeof errorBody.message !== "string"
    ) {
      return null;
    }

    return {
      success: false,
      code: errorBody.code,
      message: errorBody.message,
      data: null,
    };
  }

  const data = error.response?.data;
  if (!data || typeof data !== "object") return null;

  const errorBody = data as Partial<BankingApiErrorBody>;
  if (
    typeof errorBody.code !== "string" ||
    typeof errorBody.message !== "string"
  ) {
    return null;
  }

  return {
    success: false,
    code: errorBody.code,
    message: errorBody.message,
    data: null,
  };
}

export const bankingApi = {
  getHome: async (): Promise<AccountHomeResponse> => {
    if (import.meta.env.DEV) {
      return getDevAccountHome();
    }

    const response = await apiClient.get<
      BankingApiResponse<AccountHomeResponse>
    >("/banking/home");

    return response.data.data;
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
