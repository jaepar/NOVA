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
export { extractApiErrorBody } from './utils';

/**
 * 엔드포인트별 API 함수를 작성한 후 여기에 export 추가
 *
 * 예시:
 * export { authApi } from './endpoints/auth';
 * export { accountApi } from './endpoints/account';
 */

export { authApi } from './endpoints/auth';
export { certificateApi, getCertificateApiError } from './endpoints/certificate';
export {
  emailVerificationApi,
  getEmailVerificationApiErrorMessage,
} from './endpoints/emailVerification';
export { userApi } from './endpoints/user';
export type {
  AuthMessageResponse,
  EmailVerificationConfirmRequest,
  EmailVerificationSendRequest,
  LoginRequest,
  LoginResponse,
  SessionCheckResponse,
  SignupRequest,
} from './endpoints/auth';
export type {
  AccountCreateRequest,
  AccountCreateResponse,
  AccountHomeResponse,
  AccountHomeUiState,
  AccountSummary,
  BankingTransaction,
  BankingTransactionsResponse,
  GetTransactionsParams,
  TransactionFlowFilter,
  TransactionPeriod,
  TransactionSortDirection,
  TransactionType,
  UpdateTransactionMemoRequest,
} from './endpoints/banking';
export type { NotificationResponse, NotificationType } from './endpoints/user';
export type { LivenessSessionResponse } from './endpoints/certificate';
export type { PassportResponse } from './endpoints/certificate';
export type { CertificateRequestErrorBody } from './endpoints/certificate';
export type {
  EmailVerificationConfirmResponse,
  EmailVerificationSendResponse,
} from './endpoints/emailVerification';
export type {
  IdCardOcrResult,
  IdentityOcrResponse,
  IdentityVerificationConfirmRequest,
  IdentityVerificationResponse,
} from './endpoints/certificate';
export { createIdempotencyKey, walletApi } from './endpoints/wallet';
export type {
  ChargeWalletRequest,
  WalletCreateRequest,
  WalletNextStep,
  WalletStatusResponse,
  WalletSummaryResponse,
  WalletTransactionFlow,
  WalletTransactionResponse,
  WalletTransactionsRequest,
  WalletTransactionsResponse,
} from './endpoints/wallet';
export { jobApi } from './endpoints/job';
export { hospitalChatApi } from './endpoints/hospitalChat';
export type {
  ApplicationItemResponse,
  ApplicationListResponse,
  ApplicationPortfolioResponse,
  ApplicationStatus,
  ApplicationFormPortfolioResponse,
  ApplicationFormResponse,
  JobOpeningItemResponse,
  JobOpeningListParams,
  JobOpeningListResponse,
  JobOpeningResponse,
} from './endpoints/job';
export type {
  HospitalChatData,
  HospitalChatItem,
  HospitalChatPayload,
} from './endpoints/hospitalChat';
export { transferApi } from "./endpoints/transfer";
export type {
  SubmitRemittanceRequest,
  SubmitRemittanceResponse,
} from "./endpoints/transfer";
export { bankingApi, getBankingApiError } from './endpoints/banking';
export type {
  BankingApiErrorBody,
  TransferPreviewRequest,
  TransferPreviewResponse,
  TransferRequest,
  GlobalTransferHistoryItem,
} from './endpoints/banking';
