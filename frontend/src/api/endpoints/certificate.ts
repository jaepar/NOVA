import apiClient from '../client'

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

export type PassportOcrRawResponse = {
  version?: string
  requestId?: string
  timestamp?: number
  images?: Array<{
    uid?: string
    name?: string
    inferResult?: string
    message?: string
    validationResult?: {
      result?: string
    }
    fields?: Array<{
      name?: string
      valueType?: string
      inferText?: string
      inferConfidence?: number
    }>
  }>
}

export type PassportOcrField = {
  name: string
  text: string
  confidence?: number
}

export type PassportOcrResult = {
  success: boolean
  fields: PassportOcrField[]
  raw: PassportOcrRawResponse
}

export const certificateApi = {
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
  recognizePassport: async (imageFile: File): Promise<PassportOcrResult> => {
    const formData = new FormData()
    formData.append('file', imageFile)

    const response = await apiClient.post<ApiEnvelope<PassportOcrResult>>(
      '/users/verifications/passports',
      formData
    )
    return response.data.data
  },
}
