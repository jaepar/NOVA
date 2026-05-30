import apiClient from "../client";

type WalletApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

export type WalletNextStep = "CREATE_ACCOUNT" | "WALLET_TERMS" | "WALLET_HOME";

export type WalletStatusResponse = {
  nextStep: WalletNextStep;
};

export type WalletCreateRequest = {
  termsAgreed: boolean;
};

export type ChargeWalletRequest = {
  chargeAmount: number;
};

export type WalletTransactionFlow = "DEPOSIT" | "WITHDRAWAL";

export type WalletTransactionResponse = {
  walletTransactionId: number;
  transactionFlow: WalletTransactionFlow;
  counterparty: string;
  amount: number;
  createdAt: string;
};

export type WalletTransactionsResponse = {
  balance: number;
  transactions: WalletTransactionResponse[];
};

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const walletApi = {
  status: async (): Promise<WalletStatusResponse> => {
    const response = await apiClient.get<WalletApiResponse<WalletStatusResponse>>("/wallet/status");

    return response.data.data;
  },

  create: async (request: WalletCreateRequest): Promise<void> => {
    await apiClient.post<WalletApiResponse<null>>("/wallet", request);
  },

  transactions: async (): Promise<WalletTransactionsResponse> => {
    const response = await apiClient.get<WalletApiResponse<WalletTransactionsResponse>>("/wallet/transactions");

    return response.data.data;
  },

  charge: async (request: ChargeWalletRequest): Promise<void> => {
    await apiClient.post<WalletApiResponse<null>>("/wallet/charges", request, {
      headers: {
        "Idempotency-Key": createIdempotencyKey(),
      },
    });
  },
};
