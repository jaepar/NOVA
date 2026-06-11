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

type IdCardOcrResult = {
  name?: string
  residentRegistrationNumber?: string
  issueDate?: string
}

type IdentityOcrDocumentType = 'PASSPORT' | 'ID_CARD'

type PassportIdentityOcrResponse = {
  ocrDocumentType: IdentityOcrDocumentType
  result: PassportResponse | IdCardOcrResult | null
  nameMatchWithUser: boolean | null
}

export function normalizePassportOcrResponse(
  response: PassportIdentityOcrResponse
): PassportResponse {
  if (response.ocrDocumentType !== 'PASSPORT') {
    throw new Error(`Expected PASSPORT OCR response but received ${response.ocrDocumentType}`)
  }

  if (!response.result || typeof response.result !== 'object' || !('num' in response.result)) {
    throw new Error('PASSPORT OCR result is missing passport fields')
  }

  return response.result as PassportResponse
}
