import apiClient from "../client";
import { extractApiErrorBody } from "../utils";

type TransferApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

export type TransferApiErrorBody = {
  code: string;
  message: string;
};

export type SubmitRemittanceRequest = {
  customer_id: number | null;
  account_id: number | null;
  remit_purpose: string;
  target_country: string;
  currency: string;
  remit_amount: string;
  mediary_fee_payer: "SENDER" | "RECEIVER";
  exchange_rate: string;
  krw_amount: string;
  sender_eng_name: string;
  sender_phone: string;
  sender_address: string;
  sender_district: string;
  sender_city: string;
  sender_zip_code: string;
  sender_country: string;
  receiver_eng_name: string;
  receiver_address: string;
  receiver_district: string;
  receiver_phone: string;
  swift_code: string;
  receiver_account_num: string;
  routing_number: string;
  bank_name: string;
  remit_reason: string;
};

export type SubmitRemittanceResponse = {
  remitId?: number;
  status?: string;
};

const SUBMIT_REMITTANCE_ENDPOINT = "/global-transfer/remittance";

export const transferApi = {
  submitRemittance: async (
    payload: SubmitRemittanceRequest
  ): Promise<SubmitRemittanceResponse> => {
    const response = await apiClient.post<
      TransferApiResponse<SubmitRemittanceResponse>
    >(SUBMIT_REMITTANCE_ENDPOINT, payload);

    return response.data.data;
  },
};

export function getTransferApiError(error: unknown): TransferApiErrorBody | null {
  return extractApiErrorBody<TransferApiErrorBody>(error);
}
