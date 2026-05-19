/**
 * 공통 API 응답 타입 정의
 *
 * 백엔드 API 응답 형식에 맞춰 아래 타입들을 수정하세요.
 */

// 기본 API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 에러 응답 타입
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * 도메인별 타입은 각 엔드포인트 파일에서 정의하거나
 * 별도의 types 폴더를 만들어 관리하세요.
 *
 * 예시:
 * - src/api/types/user.ts
 * - src/api/types/account.ts
 * - src/api/types/transaction.ts
 */
