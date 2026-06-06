import apiClient from "../client";
import { extractApiErrorBody } from "../utils";

type TransferApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

export type SubmitGlobalTransferRequest = {
  accountId: number;
  remitPurpose: string;
  targetCountry: string;
  currency: string;
  remitAmount: string;
  mediaryFeePayer: "SENDER" | "RECEIVER";
  exchangeRate: string;
  krwAmount: string;
  senderEngName: string;
  senderPhone: string;
  senderAddressDetail: string;
  senderDistrict: string;
  senderCity: string;
  senderZipCode: string;
  senderCountry: string;
  receiverEngName: string;
  receiverAddressDetail: string;
  receiverDistrict?: string;
  receiverCity: string;
  receiverZipCode?: string;
  receiverPhone: string;
  swiftCode: string;
  receiverAccountNum: string;
  routingNumber: string;
  bankName: string;
  remitReason: string;
};

export type SubmitGlobalTransferResponse = {
  globalTransactionId: number;
  status: string;
};

export type TransferApiErrorBody = {
  success: false;
  code: string;
  message: string;
  data: null;
};

const SUBMIT_GLOBAL_TRANSFER_ENDPOINT = "/banking/global-transactions";

export const transferApi = {
  submitGlobalTransfer: async (
    payload: SubmitGlobalTransferRequest,
    idempotencyKey: string
  ): Promise<SubmitGlobalTransferResponse> => {
    const response = await apiClient.post<
      TransferApiResponse<SubmitGlobalTransferResponse>
    >(SUBMIT_GLOBAL_TRANSFER_ENDPOINT, payload, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });

    return response.data.data;
  },
};

export function getTransferApiError(error: unknown): TransferApiErrorBody | null {
  return extractApiErrorBody<TransferApiErrorBody>(error);
}
