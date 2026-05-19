# API 사용 가이드

## 개요

이 폴더에는 공통 Axios 클라이언트 설정과 타입 정의가 포함되어 있습니다.
API 엔드포인트 함수는 팀원들이 백엔드 개발에 맞춰 작성하면 됩니다.

## 폴더 구조

```
src/api/
├── client.ts              # ✅ Axios 인스턴스 설정 (완료)
├── types.ts               # ✅ 공통 응답 타입 (완료)
├── index.ts               # ✅ Export 통합 (완료)
├── README.md              # 이 문서
└── endpoints/             # ⚠️ 팀원들이 작성할 API 함수들
    └── (빈 폴더)
```

## 이미 구현된 기능

### 1. Axios Client (`client.ts`)

**Request Interceptor:**
- 자동으로 `Authorization: Bearer {token}` 헤더 추가
- 개발 환경에서 요청 로깅

**Response Interceptor:**
- 401 (인증 실패): 자동 로그아웃 및 토큰 삭제
- 403, 404, 500 등: 에러 로깅
- 개발 환경에서 응답 로깅

**토큰 관리:**
- localStorage에 `accessToken`, `refreshToken` 자동 저장
- 모든 요청에 자동으로 토큰 포함

### 2. 공통 타입 (`types.ts`)

- `ApiResponse<T>`: 기본 API 응답 형식
- `PaginatedResponse<T>`: 페이지네이션 응답 형식
- `ApiError`: 에러 응답 형식

## 환경 변수 설정

`.env` 파일을 생성하고 백엔드 API URL을 설정하세요:

```env
VITE_API_BASE_URL=https://your-api-url.com
VITE_ENV=development
```

## 기본 사용법

### 1. 직접 apiClient 사용

```tsx
import { apiClient, ApiResponse } from '@/api';

// GET 요청
const response = await apiClient.get<ApiResponse<User>>('/users/me');
const user = response.data.data;

// POST 요청
const response = await apiClient.post<ApiResponse<Account>>('/accounts', {
  accountName: 'My Account',
  currency: 'KRW'
});
```

### 2. 컴포넌트에서 사용 예시

```tsx
import { useEffect, useState } from 'react';
import { apiClient, ApiResponse } from '@/api';

interface User {
  id: string;
  name: string;
  email: string;
}

function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get<ApiResponse<User>>('/users/me');
        setUser(response.data.data);
      } catch (err) {
        setError('Failed to load user');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return null;

  return <div>Welcome, {user.name}!</div>;
}
```

### 3. 에러 처리

```tsx
import { AxiosError } from 'axios';
import { apiClient, ApiError } from '@/api';

try {
  await apiClient.post('/auth/login', { email, password });
} catch (error) {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    console.error('API Error:', apiError?.error?.message || 'Unknown error');
  }
}
```

## API 엔드포인트 함수 작성 가이드

백엔드 API가 준비되면 아래 패턴으로 엔드포인트 함수를 작성하세요.

### 1. 엔드포인트 파일 생성

`src/api/endpoints/auth.ts` 예시:

```tsx
import apiClient from '../client';
import { ApiResponse } from '../types';

// 타입 정의
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// API 함수 객체
export const authApi = {
  // 로그인
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
    
    // 토큰 저장
    if (response.data.data.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    
    return response.data.data;
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    
    // 토큰 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  // 현재 사용자 조회
  getCurrentUser: async () => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },
};
```

### 2. Export 추가

`src/api/index.ts`에 추가:

```tsx
export { authApi } from './endpoints/auth';
```

### 3. 컴포넌트에서 사용

```tsx
import { authApi } from '@/api';

// 로그인
await authApi.login({ email, password });

// 현재 사용자 조회
const user = await authApi.getCurrentUser();
```

## 권장 폴더 구조

```
src/api/
├── client.ts
├── types.ts
├── index.ts
├── README.md
└── endpoints/
    ├── auth.ts           # 인증 관련
    ├── account.ts        # 계좌 관리
    ├── transaction.ts    # 거래 내역
    ├── notification.ts   # 알림
    └── exchange.ts       # 환율 정보
```

또는 타입을 분리하려면:

```
src/api/
├── client.ts
├── types/
│   ├── common.ts         # 공통 타입
│   ├── user.ts           # 사용자 타입
│   ├── account.ts        # 계좌 타입
│   └── transaction.ts    # 거래 타입
├── endpoints/
│   ├── auth.ts
│   ├── account.ts
│   └── ...
└── index.ts
```

## 체크리스트

API 개발 시 확인 사항:

- [ ] `.env` 파일에 `VITE_API_BASE_URL` 설정
- [ ] 백엔드 API 응답 형식에 맞춰 `types.ts` 수정
- [ ] 엔드포인트별로 `endpoints/` 폴더에 파일 생성
- [ ] 작성한 API 함수를 `index.ts`에 export
- [ ] 모든 API 호출에 try-catch 에러 처리
- [ ] 토큰이 필요한 API는 로그인 후 호출
- [ ] TypeScript 타입 정의로 타입 안전성 확보

## 주의사항

1. **Base URL**: 반드시 `.env` 파일 설정 필요
2. **토큰 보안**: localStorage 사용 중 (프로덕션 환경에서는 보안 검토 필요)
3. **에러 처리**: 모든 API 호출에 try-catch 사용 권장
4. **401 처리**: client.ts에서 자동 로그아웃 처리됨
5. **CORS**: 백엔드에서 CORS 설정 확인 필요
