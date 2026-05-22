# NOVA Frontend

외국인 대상 비대면 금융/생활 서비스 NOVA의 프론트엔드입니다.
웹에서 확인하더라도 모바일 앱과 동일한 화면 규격과 레이아웃 원칙을 유지하도록 설계되어 있습니다.

## 1. 프로젝트 목적
- 모바일 앱 기준 UI/UX를 웹에서도 일관되게 제공
- 공통 레이아웃과 디자인 시스템 기반 개발로 페이지 품질 편차 최소화
- API 연동을 위한 표준 클라이언트 계층 제공

## 2. 기술 스택
- React 18
- TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Axios
- pnpm

## 3. 시작하기
### 3.1 요구사항
- Node.js 18 이상
- pnpm

### 3.2 설치 및 실행
```bash
cd frontend
pnpm install
pnpm dev
```
기본 주소: `http://localhost:5173`

### 3.3 빌드
```bash
pnpm build
```

## 4. 문서 우선순위
1. `frontend/AGENTS.md`
2. `frontend/guidelines/DESIGN_SYSTEM.md`
3. `frontend/guidelines/LAYOUT_GUIDELINES.md`
4. 기존 구현 코드

## 5. 프론트엔드 라우팅 규칙 (도메인 분리)
협업 시 머지 충돌을 줄이기 위해 라우팅은 반드시 분리 후 조립 방식으로 관리한다.

1. `src/app/routes/` 하위 도메인 라우트 파일에서만 라우트를 추가/수정한다.
   - 예: `mainRoutes.tsx`, `walletRoutes.tsx`, `certificateRoutes.tsx`
2. 각 도메인 라우트 파일은 `RouteObject[]`를 export 한다.
3. `src/app/routes/index.ts`에서 도메인 라우트를 병합해 `appRoutes`를 구성한다.
4. `src/app/routes.tsx`는 얇은 조립 파일로 유지하고, `appRoutes`로만 라우터를 생성한다.
   - 명시 import 사용: `import { appRoutes } from "./routes/index";`
5. fallback 라우트(`{ path: "*", ... }`, 예: NotFound)는 `appRoutes`의 마지막에만 추가한다.

fallback 뒤에는 일반 라우트를 배치하지 않는다.

## 6. API 작업 원칙
- API 계층 작업 전 `src/api/AGENTS.md`, `src/api/README.md`를 확인한다.
- API 호출은 공통 `apiClient` 기반으로 처리한다.
- 요청/응답 타입을 명시하고 `index.ts` export를 동기화한다.
- 민감 정보 로그 출력은 금지한다.

## 7. 유지보수 정책
레이아웃 또는 디자인 규칙이 바뀌면 아래 문서를 함께 업데이트한다.
- `frontend/AGENTS.md`
- `frontend/guidelines/DESIGN_SYSTEM.md`
- `frontend/guidelines/LAYOUT_GUIDELINES.md`
