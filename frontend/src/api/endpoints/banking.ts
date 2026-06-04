import { AxiosError } from 'axios'
import apiClient from '../client'

type BankingApiResponse<T> = {
  success: boolean
  code: string
  message: string
  data: T
}

export type TransferPreviewRequest = {
  recipientBankCode: string
  recipientAccountNumber: string
}

export type TransferRequest = {
  withdrawAccountId: string
  depositAccountId: string
  transferAmount: number
  accountPassword: string
}

export type TransferPreviewResponse = {
  myAccount: {
    accountName: string
    accountNumber: string
    balance: number
    transferLimit: number
    userName: string
  }
  recipient: {
    recipientName: string
  }
}

export type BankingApiErrorBody = {
  success: false
  code: string
  message: string
  data: null
}

export function getBankingApiError(error: unknown): BankingApiErrorBody | null {
  if (!(error instanceof AxiosError)) {
    if (!error || typeof error !== 'object') return null

    const errorBody = error as Partial<BankingApiErrorBody>
    if (typeof errorBody.code !== 'string' || typeof errorBody.message !== 'string') return null

    return {
      success: false,
      code: errorBody.code,
      message: errorBody.message,
      data: null,
    }
  }

  const data = error.response?.data
  if (!data || typeof data !== 'object') return null

  const errorBody = data as Partial<BankingApiErrorBody>
  if (typeof errorBody.code !== 'string' || typeof errorBody.message !== 'string') return null

  return {
    success: false,
    code: errorBody.code,
    message: errorBody.message,
    data: null,
  }
}

export const bankingApi = {
  previewTransfer: async (
    request: TransferPreviewRequest
  ): Promise<TransferPreviewResponse> => {
    const response = await apiClient.post<BankingApiResponse<TransferPreviewResponse>>(
      '/banking/transfers/preview',
      request
    )

    return response.data.data
  },
  transfer: async (request: TransferRequest, idempotencyKey: string): Promise<void> => {
    const response = await apiClient.post<BankingApiResponse<null>>('/banking/transfers', request, {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    })

    if (!response.data.success) {
      throw response.data
    }
  },
}
