import { translateError } from '../../app/i18n'
import { extractApiErrorBody } from '../utils'
import { authApi } from './auth'

export type EmailVerificationSendResponse = Record<string, never>

export type EmailVerificationConfirmResponse = {
  verified: true
}

type EmailVerificationApiErrorBody = {
  code: string
  message: string
}

export class EmailVerificationApiError extends Error {
  code: string | null

  constructor(message: string, code: string | null = null) {
    super(message)
    this.name = 'EmailVerificationApiError'
    this.code = code
  }
}

function toEmailVerificationApiError(
  error: unknown,
  fallbackMessage: string
): EmailVerificationApiError {
  if (error instanceof EmailVerificationApiError) {
    return error
  }

  const errorBody = extractApiErrorBody<EmailVerificationApiErrorBody>(error)
  const code = errorBody?.code ?? null
  const message = code
    ? translateError(code, errorBody?.message ?? fallbackMessage)
    : fallbackMessage

  return new EmailVerificationApiError(message, code)
}

export const emailVerificationApi = {
  send: async (email: string): Promise<EmailVerificationSendResponse> => {
    try {
      await authApi.sendEmailVerification({ email })
      return {}
    } catch (error) {
      throw toEmailVerificationApiError(
        error,
        '인증번호를 발송할 수 없습니다. 다시 시도해주세요.'
      )
    }
  },
  confirm: async (
    email: string,
    code: string
  ): Promise<EmailVerificationConfirmResponse> => {
    try {
      await authApi.confirmEmailVerification({ email, code })
      return { verified: true }
    } catch (error) {
      throw toEmailVerificationApiError(
        error,
        '인증번호를 확인할 수 없습니다. 다시 입력해주세요.'
      )
    }
  },
}

export function getEmailVerificationApiErrorMessage(error: unknown) {
  if (error instanceof EmailVerificationApiError) {
    return translateError(error.code, error.message)
  }

  return error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.'
}
