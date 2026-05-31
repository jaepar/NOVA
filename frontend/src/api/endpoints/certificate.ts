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

type OcrFieldCandidate = {
  text?: string
  confidenceScore?: number
  formatted?: {
    value?: string
    year?: string
    month?: string
    day?: string
  }
}

type OcrExtractedValue = {
  text: string
  confidence?: number
}

const getFirstValueWithConfidence = (value: unknown): OcrExtractedValue | null => {
  if (!value) return null

  if (typeof value === 'string') {
    const normalized = value.trim()
    return normalized.length > 0 ? { text: normalized } : null
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const candidate = item as OcrFieldCandidate
      const formattedValue = candidate?.formatted?.value?.trim()
      if (formattedValue) {
        return { text: formattedValue, confidence: candidate?.confidenceScore }
      }

      const year = candidate?.formatted?.year?.trim()
      const month = candidate?.formatted?.month?.trim()
      const day = candidate?.formatted?.day?.trim()
      if (year && month && day) {
        return { text: `${year}.${month}.${day}`, confidence: candidate?.confidenceScore }
      }

      const textValue = candidate?.text?.trim()
      if (textValue) return { text: textValue, confidence: candidate?.confidenceScore }
    }
  }

  if (typeof value === 'object') {
    const candidate = value as OcrFieldCandidate
    const formattedValue = candidate?.formatted?.value?.trim()
    if (formattedValue) return { text: formattedValue, confidence: candidate?.confidenceScore }
    const textValue = candidate?.text?.trim()
    if (textValue) return { text: textValue, confidence: candidate?.confidenceScore }
  }

  return null
}

const pushField = (
  target: PassportOcrField[],
  name: string,
  value: unknown,
  confidence?: number
) => {
  const extracted = getFirstValueWithConfidence(value)
  if (!extracted) return
  target.push({
    name,
    text: extracted.text,
    confidence: extracted.confidence ?? confidence,
  })
}

const extractStructuredPassportFields = (raw: PassportOcrRawResponse): PassportOcrField[] => {
  const fields: PassportOcrField[] = []
  const image = raw.images?.[0] as
    | (NonNullable<PassportOcrRawResponse['images']>[number] & {
        idCard?: { result?: { pp?: Record<string, unknown> } }
        passport?: { passportResult?: Record<string, unknown> }
      })
    | undefined

  const pp = image?.idCard?.result?.pp
  // console.log(pp);
  if (pp) {
    pushField(fields, 'doc_type', pp.type)
    pushField(fields, 'nationality_code', pp.issueCountry)
    pushField(fields, 'passport_number', pp.num)
    pushField(fields, 'surname', pp.surName)
    pushField(fields, 'given_name', pp.givenName)
    pushField(fields, 'birth_date', pp.birthDate)
    pushField(fields, 'sex', pp.sex)
    pushField(fields, 'nationality', pp.nationality)
    pushField(fields, 'authority', pp.authority)
    pushField(fields, 'issue_date', pp.issueDate)
    pushField(fields, 'expiry_date', pp.expireDate)
  }

  const passportResult = image?.passport?.passportResult
  if (passportResult) {
    pushField(fields, 'doc_type', passportResult.documentType ?? passportResult.type)
    pushField(
      fields,
      'nationality_code',
      passportResult.issuingState ?? passportResult.countryCode ?? passportResult.nationalityCode
    )
    pushField(
      fields,
      'passport_number',
      passportResult.passportNumber ?? passportResult.documentNumber
    )
    pushField(fields, 'surname', passportResult.surname ?? passportResult.lastName)
    pushField(fields, 'given_name', passportResult.givenNames ?? passportResult.firstName)
    pushField(fields, 'birth_date', passportResult.dateOfBirth ?? passportResult.birthDate)
    pushField(fields, 'sex', passportResult.sex ?? passportResult.gender)
    pushField(fields, 'nationality', passportResult.nationality)
    pushField(fields, 'issue_date', passportResult.issueDate)
    pushField(fields, 'expiry_date', passportResult.dateOfExpiry ?? passportResult.expiryDate)
  }

  return fields
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
    const genericFields =
      raw.images?.[0]?.fields
        ?.filter((field): field is NonNullable<typeof field> => Boolean(field))
        .map((field) => ({
          name: field.name ?? '',
          text: field.inferText ?? '',
          confidence: field.inferConfidence,
        })) ?? []
    const structuredFields = extractStructuredPassportFields(raw)
    // console.log(structuredFields)
    const fields = [...genericFields, ...structuredFields]

    return {
      success: raw.images?.[0]?.inferResult === 'SUCCESS',
      fields,
      raw,
    }
  },
}
