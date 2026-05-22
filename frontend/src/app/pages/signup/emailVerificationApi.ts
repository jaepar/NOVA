export type EmailVerificationSendResponse = Record<string, never> | {
  expiresInSeconds?: number;
};

export type EmailVerificationConfirmResponse = {
  verified?: boolean;
};

const MOCK_DELAY_MS = 300;

function waitForMockResponse() {
  return new Promise((resolve) => {
    window.setTimeout(resolve, MOCK_DELAY_MS);
  });
}

// TODO: Replace this signup-only mock with real apiClient calls after the backend contract is ready.
export async function sendEmailVerification(email: string): Promise<EmailVerificationSendResponse> {
  await waitForMockResponse();

  return email ? { expiresInSeconds: 60 } : {};
}

export async function confirmEmailVerification(
  email: string,
  code: string,
): Promise<EmailVerificationConfirmResponse> {
  await waitForMockResponse();

  return { verified: Boolean(email) && /^\d{6}$/.test(code) };
}
