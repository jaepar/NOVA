# API 사용 가이드 (`src/api`)

이 폴더는 프론트엔드 API 연동의 공통 기반을 제공합니다.

우선 규칙 문서:

- `src/api/AGENTS.md`

## 개요

현재 구현된 파일:

- `client.ts`: Axios 인스턴스 및 인터셉터
- `types.ts`: 공통 응답 타입
- `index.ts`: API 레이어 export 진입점

팀원들이 도메인별 API 모듈을 빠르게 확장할 수 있도록 구성되어 있습니다.

## 현재 폴더 구조

```text
src/api/
├── AGENTS.md
├── client.ts
├── types.ts
├── index.ts
└── README.md
```

## 이미 구현된 내용

### 1) 공통 Axios 클라이언트 (`client.ts`)

- `VITE_API_BASE_URL` 기반 Base URL 설정 (로컬 안전용 fallback 포함)
- 기본 timeout: `10000ms`
- 기본 헤더: `Content-Type: application/json`

요청 인터셉터:

- localStorage의 `accessToken` 조회
- 토큰 존재 시 `Authorization: Bearer <token>` 자동 주입
- 개발 환경에서 요청 로그 출력

응답 인터셉터:

- 개발 환경에서 응답 로그 출력
- `401`, `403`, `404`, `500` 상태 코드 중앙 처리
- `401` 발생 시 `accessToken` 제거

### 2) 공통 API 타입 (`types.ts`)

- `ApiResponse<T>`: 기본 envelope (`success`, `data`, `message?`)
- `PaginatedResponse<T>`: 페이지네이션 envelope (`pagination` 포함)
- `ApiError`: 에러 envelope (`success: false`, `error`)

### 3) 공용 Export 진입점 (`index.ts`)

- 현재 제공:
  - `apiClient`
  - `types.ts`의 공통 타입들

## 환경 변수 설정

`.env` 파일에 아래를 설정하세요.

```env
VITE_API_BASE_URL=https://your-api-url.com
```

참고:

- 개발 로그 분기는 `import.meta.env.DEV`를 사용합니다.
- 별도 커스텀 환경변수 없이 동작합니다.

## 기본 사용 예시

```ts
import { apiClient, ApiResponse } from '@/api'

interface User {
  id: string
  name: string
}

const res = await apiClient.get<ApiResponse<User>>('/users/me')
const user = res.data.data
```

## 엔드포인트 모듈 작성 패턴 (권장)

백엔드 계약이 준비되면 `src/api/endpoints/` 아래에 도메인별 모듈을 추가합니다.

예시:

```ts
// src/api/endpoints/auth.ts
import apiClient from '../client'
import type { ApiResponse } from '../types'

interface LoginRequest {
  email: string
  password: string
}

interface UserDto {
  id: string
  name: string
  email: string
}

interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: UserDto
}

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload)

    // 팀 정책 확정 시 토큰 저장
    const { accessToken, refreshToken } = res.data.data
    if (accessToken) localStorage.setItem('accessToken', accessToken)
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)

    return res.data.data
  },
}
```

작성 후 `src/api/index.ts`에 export를 추가하세요.

```ts
export { authApi } from './endpoints/auth'
```

## 확장 권장 구조

```text
src/api/
├── AGENTS.md
├── client.ts
├── types.ts
├── index.ts
├── endpoints/
│   ├── auth.ts
│   ├── account.ts
│   ├── transaction.ts
│   ├── notification.ts
│   └── exchange.ts
└── types/
    ├── auth.ts
    ├── account.ts
    ├── transaction.ts
    └── common.ts
```

## 팀 체크리스트

- [ ] `VITE_API_BASE_URL`이 올바르게 설정되었는가
- [ ] 새 API는 반드시 `apiClient`를 사용하는가 (raw axios 금지)
- [ ] 요청/응답 DTO 타입이 명시되었는가
- [ ] 새 모듈 export를 `src/api/index.ts`에 추가했는가
- [ ] 4xx/5xx 에러 경로를 호출부에서 처리했는가
- [ ] 민감 정보 로그가 운영 경로에 남지 않는가

## 금융 도메인 가드레일

- 프론트 API 모듈에서 금액 확정 로직을 수행하지 않습니다.
- 프론트 API 모듈에서 원장/상태 확정 로직을 수행하지 않습니다.
- 원장성 데이터의 최종 진실 원천은 백엔드/코어뱅킹 응답입니다.
- 계약 불일치가 발생하면 안전하게 실패하고 명시적 오류를 반환합니다.
