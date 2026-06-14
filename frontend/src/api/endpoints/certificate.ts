import apiClient from '../client'
import { extractApiErrorBody } from '../utils'
import {
  parsePassportOcrResponse,
  type PassportOcrResponse,
  type PassportResponse,
} from './certificatePassport'

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

export type IdCardOcrResult = {
  name?: string
  residentRegistrationNumber?: string
  issueDate?: string
}

export type IdentityVerificationResponse = {
  ocrDocumentType: 'PASSPORT' | 'ID_CARD'
  nameMatchWithUser: boolean | null
  identityMatchWithGovDb: boolean
  verificationStatus: 'OCR_EXTRACTED' | 'VERIFIED' | 'FAILED' | string
  failureReasonCode: string | null
}

export type IdentityOcrResponse = {
  ocrDocumentType: 'PASSPORT' | 'ID_CARD'
  result: IdCardOcrResult | PassportResponse | null
  nameMatchWithUser: boolean | null
}

export type IdentityVerificationConfirmRequest = {
  ocrDocumentType: 'ID_CARD'
  name: string
  residentRegistrationNumber: string
  issueDate: string
}

export type CertificateRequestErrorBody = {
  code: string
  message: string
}

export type CorrectionDocumentType =
  | 'RESIDENCE_VERIFICATION_DOCUMENT'
  | 'ALIEN_REGISTRATION_SUPPORTING_DOCUMENT'

export type CorrectionDocumentStatus = 'REJECTED' | 'APPROVED'

export type CorrectionDocumentResponse = {
  documentType: CorrectionDocumentType
  status: CorrectionDocumentStatus
  rejectionReasonCodes: string[]
}

type RawCorrectionDocumentResponse = {
  documentType: CorrectionDocumentType
  status: CorrectionDocumentStatus
  rejectionReasonCodes?: string[] | string | null
  rejectionReasons?: string[] | string | null
  missingItems?: string[] | string | null
  missing?: string | null
}

export type CorrectionDocumentUploadRequest = {
  residenceVerificationPdf?: File
  alienRegistrationApplicationPdf?: File
}

export const certificateApi = {
  requestIssuance: async (): Promise<void> => {
    await apiClient.post<ApiEnvelope<null>>('/users/verifications')
  },
  getCorrectionDocuments: async (): Promise<CorrectionDocumentResponse[]> => {
    const response = await apiClient.get<ApiEnvelope<RawCorrectionDocumentResponse[]>>(
      '/users/documents/corrections'
    )
    return response.data.data.map(normalizeCorrectionDocument)
  },
  uploadCorrectionDocuments: async ({
    residenceVerificationPdf,
    alienRegistrationApplicationPdf,
  }: CorrectionDocumentUploadRequest): Promise<void> => {
    const formData = new FormData()

    if (residenceVerificationPdf) {
      formData.append('residenceVerificationPdf', residenceVerificationPdf)
    }

    if (alienRegistrationApplicationPdf) {
      formData.append('alienRegistrationApplicationPdf', alienRegistrationApplicationPdf)
    }

    await apiClient.post<ApiEnvelope<null>>('/users/documents', formData)
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
  recognizePassport: async (imageFile: File): Promise<PassportOcrResponse> => {
    const formData = new FormData()
    formData.append('file', imageFile)

    const response = await apiClient.post<ApiEnvelope<IdentityOcrResponse>>(
      '/users/verifications/identity?ocrDocumentType=PASSPORT',
      formData
    )
    return parsePassportOcrResponse(response.data.data)
  },
  recognizeIdCard: async (imageFile: File): Promise<IdentityOcrResponse> => {
    const formData = new FormData()
    formData.append('file', imageFile)

    const response = await apiClient.post<ApiEnvelope<IdentityOcrResponse>>(
      '/users/verifications/identity?ocrDocumentType=ID_CARD',
      formData
    )
    return response.data.data
  },
  confirmIdentity: async (
    payload: IdentityVerificationConfirmRequest
  ): Promise<IdentityVerificationResponse> => {
    const response = await apiClient.post<ApiEnvelope<IdentityVerificationResponse>>(
      '/users/verifications/identity/confirm',
      payload
    )
    return response.data.data
  },
}

function normalizeCorrectionDocument(document: RawCorrectionDocumentResponse): CorrectionDocumentResponse {
  return {
    documentType: document.documentType,
    status: document.status,
    rejectionReasonCodes: normalizeRejectionReasonCodes(
      document.rejectionReasonCodes
        ?? document.rejectionReasons
        ?? document.missingItems
        ?? document.missing
    ),
  }
}

function normalizeRejectionReasonCodes(value: RawCorrectionDocumentResponse['rejectionReasonCodes'] | string | null | undefined) {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

export function getCertificateApiError(error: unknown): CertificateRequestErrorBody | null {
  return extractApiErrorBody<CertificateRequestErrorBody>(error)
}
