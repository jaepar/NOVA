import apiClient from '../client'
import { extractApiErrorBody } from '../utils'

type ApiEnvelope<T> = {
  success: boolean
  code: string
  message: string
  data: T
}

export type LivenessSessionResponse = {
  sessionId: string
  expiresAt: string
}

export type LivenessResultResponse = {
  sessionId: string
  status: string
  score: number
  decision: 'PASS' | 'FAIL'
  reasonCode: string
}

export type LivenessFinalizeResponse = {
  sessionId: string
  livenessScore: number
  similarityScore: number
  decision: 'PASS' | 'FAIL'
  reasonCode: string
}

export type FaceMatchRequest = {
  registeredImageBucket: string
  registeredImageKey: string
}

export type PassportResponse = {
  type?: string
  issueCountry?: string
  num?: string
  surName?: string
  givenName?: string
  nationality?: string
  birthDate?: string
  sex?: string
  issueDate?: string
  expireDate?: string
  authority?: string
}

export type IdCardOcrResult = {
  name?: string
  residentRegistrationNumber?: string
  issueDate?: string
}

export type IdentityVerificationResponse = {
  ocrDocumentType: 'PASSPORT' | 'ID_CARD'
  result: IdCardOcrResult | PassportResponse | null
  nameMatchWithUser: boolean
  identityMatchWithGovDb: boolean
  verificationStatus: 'OCR_EXTRACTED' | 'VERIFIED' | 'FAILED' | string
  failureReasonCode: string | null
}

export type CertificateRequestErrorBody = {
  code: string
  message: string
}

export const certificateApi = {
  requestIssuance: async (): Promise<void> => {
    await apiClient.post<ApiEnvelope<null>>('/users/verifications')
  },
  createLivenessSession: async (): Promise<LivenessSessionResponse> => {
    const response = await apiClient.post<ApiEnvelope<LivenessSessionResponse>>(
      '/users/verifications/liveness'
    )
    return response.data.data
  },
  getLivenessResult: async (sessionId: string): Promise<LivenessResultResponse> => {
    const response = await apiClient.get<ApiEnvelope<LivenessResultResponse>>(
      `/users/verifications/liveness/${sessionId}`
    )
    return response.data.data
  },
  finalizeLiveness: async (
    sessionId: string,
    payload: FaceMatchRequest
  ): Promise<LivenessFinalizeResponse> => {
    const response = await apiClient.post<ApiEnvelope<LivenessFinalizeResponse>>(
      `/users/verifications/liveness/${sessionId}/finalize`,
      payload
    )
    return response.data.data
  },
  recognizePassport: async (imageFile: File): Promise<PassportResponse> => {
    const formData = new FormData()
    formData.append('file', imageFile)

    const response = await apiClient.post<ApiEnvelope<PassportResponse>>(
      '/users/verifications/passports',
      formData
    )
    return response.data.data
  },
  recognizeIdCard: async (imageFile: File): Promise<IdentityVerificationResponse> => {
    const formData = new FormData()
    formData.append('file', imageFile)

    const response = await apiClient.post<ApiEnvelope<IdentityVerificationResponse>>(
      '/users/verifications/identity?ocrDocumentType=ID_CARD',
      formData
    )
    return response.data.data
  },
}

export function getCertificateApiError(error: unknown): CertificateRequestErrorBody | null {
  return extractApiErrorBody<CertificateRequestErrorBody>(error)
}
