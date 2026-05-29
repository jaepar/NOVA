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
    const ocrUrl = import.meta.env.VITE_CLOVA_OCR_URL as string | undefined
    const ocrSecret = import.meta.env.VITE_CLOVA_OCR_SECRET as string | undefined

    if (!ocrUrl || !ocrSecret) {
      throw new Error('OCR 연동 환경변수가 설정되지 않았습니다.')
    }

    const message = {
      version: 'V2',
      requestId: crypto.randomUUID(),
      timestamp: Date.now(),
      images: [
        {
          format: 'jpg',
          name: 'passport',
        },
      ],
    }

    const formData = new FormData()
    formData.append('message', JSON.stringify(message))
    formData.append('file', imageFile)

    const response = await apiClient.post<PassportOcrRawResponse>(ocrUrl, formData, {
      headers: {
        'X-OCR-SECRET': ocrSecret,
      },
    })

    const raw = response.data
    const fields =
      raw.images?.[0]?.fields
        ?.filter((field): field is NonNullable<typeof field> => Boolean(field))
        .map((field) => ({
          name: field.name ?? '',
          text: field.inferText ?? '',
          confidence: field.inferConfidence,
        })) ?? []

    return {
      success: raw.images?.[0]?.inferResult === 'SUCCESS',
      fields,
      raw,
    }
  },
}
