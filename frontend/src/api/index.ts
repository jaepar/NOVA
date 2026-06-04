/**
 * API 통합 Export
 *
 * 사용 예시:
 * import { apiClient } from '@/api';
 *
 * const response = await apiClient.get('/your-endpoint');
 */

export { default as apiClient } from './client'
export * from './types'

/**
 * 엔드포인트별 API 함수를 작성한 후 여기에 export 추가
 *
 * 예시:
 * export { authApi } from './endpoints/auth';
 * export { accountApi } from './endpoints/account';
 */

export { authApi } from './endpoints/auth';
export { certificateApi } from './endpoints/certificate';
export type {
  AuthMessageResponse,
  LoginRequest,
  LoginResponse,
  SessionCheckResponse,
  SignupRequest,
} from './endpoints/auth';
export type { LivenessSessionResponse } from './endpoints/certificate';
export type { PassportResponse } from './endpoints/certificate';
export { walletApi } from './endpoints/wallet';
export type {
  ChargeWalletRequest,
  WalletCreateRequest,
  WalletNextStep,
  WalletStatusResponse,
  WalletTransactionFlow,
  WalletTransactionResponse,
  WalletTransactionsResponse,
} from './endpoints/wallet';
