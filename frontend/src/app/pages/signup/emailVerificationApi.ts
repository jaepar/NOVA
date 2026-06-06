import { authApi, extractApiErrorBody } from "../../../api";

export type EmailVerificationSendResponse = Record<string, never>;

export type EmailVerificationConfirmResponse = {
  verified?: boolean;
};

type EmailVerificationApiErrorBody = {
  code: string;
  message: string;
};

const emailVerificationErrorMessages: Record<string, string> = {
  "40000": "입력한 이메일과 인증번호를 다시 확인해주세요.",
  "AUTH-007": "올바른 이메일 형식이 아닙니다.",
  "AUTH-008": "인증번호 재발송은 60초 후에 가능합니다.",
  "AUTH-009": "인증번호 이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.",
  "AUTH-010": "인증번호가 만료되었습니다. 인증번호를 다시 받아주세요.",
  "AUTH-011": "인증번호가 일치하지 않습니다.",
};

export class EmailVerificationApiError extends Error {
  code: string | null;

  constructor(message: string, code: string | null = null) {
    super(message);
    this.name = "EmailVerificationApiError";
    this.code = code;
  }
}

function toEmailVerificationApiError(
  error: unknown,
  fallbackMessage: string,
): EmailVerificationApiError {
  if (error instanceof EmailVerificationApiError) {
    return error;
  }

  const errorBody = extractApiErrorBody<EmailVerificationApiErrorBody>(error);
  const code = errorBody?.code ?? null;
  const backendMessage = errorBody?.message;
  const message = code
    ? emailVerificationErrorMessages[code] ?? backendMessage ?? fallbackMessage
    : fallbackMessage;

  return new EmailVerificationApiError(message, code);
}

export async function sendEmailVerification(email: string): Promise<EmailVerificationSendResponse> {
  try {
    await authApi.sendEmailVerification({ email });
    return {};
  } catch (error) {
    throw toEmailVerificationApiError(
      error,
      "인증번호를 발송할 수 없습니다. 다시 시도해주세요.",
    );
  }
}

export async function confirmEmailVerification(
  email: string,
  code: string,
): Promise<EmailVerificationConfirmResponse> {
  try {
    await authApi.confirmEmailVerification({ email, code });
    return { verified: true };
  } catch (error) {
    throw toEmailVerificationApiError(
      error,
      "인증번호를 확인할 수 없습니다. 다시 입력해주세요.",
    );
  }
}

export function getEmailVerificationErrorMessage(error: unknown) {
  if (error instanceof EmailVerificationApiError) {
    return error.message;
  }

  return error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.";
}
