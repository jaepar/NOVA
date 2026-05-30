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

const DEV_MOCK_WALLET_NEXT_STEP: WalletNextStep = "CREATE_ACCOUNT";

function getDevWalletStatus(): WalletStatusResponse {
  return { nextStep: DEV_MOCK_WALLET_NEXT_STEP };
}

export const walletApi = {
  status: async (): Promise<WalletStatusResponse> => {
    if (import.meta.env.DEV) {
      return getDevWalletStatus();
    }

    const response = await apiClient.get<WalletApiResponse<WalletStatusResponse>>("/wallet/status");

    return response.data.data;
  },
};
