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

export const walletApi = {
  status: async (): Promise<WalletStatusResponse> => {
    const response = await apiClient.get<WalletApiResponse<WalletStatusResponse>>("/wallet/status");

    return response.data.data;
  },

  create: async (request: WalletCreateRequest): Promise<void> => {
    await apiClient.post<WalletApiResponse<null>>("/wallet", request);
  },
};
