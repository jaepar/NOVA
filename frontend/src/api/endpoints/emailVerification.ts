import { extractApiErrorBody } from '../utils'
import { authApi } from './auth'

export type EmailVerificationSendResponse = Record<string, never>

export type EmailVerificationConfirmResponse = {
  verified: true
}

export type EmailVerificationApiErrorBody = {
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

function toEmailVerificationApiError(error: unknown): EmailVerificationApiError {
  if (error instanceof EmailVerificationApiError) {
    return error
  }

  const errorBody = extractApiErrorBody<EmailVerificationApiErrorBody>(error)
  const code = errorBody?.code ?? null
  const message = errorBody?.message ?? (error instanceof Error ? error.message : '')

  return new EmailVerificationApiError(message, code)
}

export const emailVerificationApi = {
  send: async (email: string): Promise<EmailVerificationSendResponse> => {
    try {
      await authApi.sendEmailVerification({ email })
      return {}
    } catch (error) {
      throw toEmailVerificationApiError(error)
    }
  },
  sendForSignup: async (email: string): Promise<EmailVerificationSendResponse> => {
    try {
      await authApi.sendSignupEmailVerification({ email })
      return {}
    } catch (error) {
      throw toEmailVerificationApiError(error)
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
      throw toEmailVerificationApiError(error)
    }
  },
}

export function getEmailVerificationApiError(error: unknown) {
  if (error instanceof EmailVerificationApiError) {
    return {
      code: error.code,
      message: error.message,
    }
  }

  return extractApiErrorBody<EmailVerificationApiErrorBody>(error)
}
