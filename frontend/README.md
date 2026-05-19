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

기본 주소:

- `http://localhost:5173`

### 3.3 빌드

```bash
pnpm build
```

## 4. 문서 우선순위

프론트엔드 작업 시 아래 순서로 규칙을 적용합니다.

1. `frontend/AGENTS.md`
2. `frontend/guidelines/DESIGN_SYSTEM.md`
3. `frontend/guidelines/LAYOUT_GUIDELINES.md`
4. 기존 구현 코드

## 5. 핵심 개발 규칙

### 5.1 프레임/반응형

- 기준 프레임은 `390 x 844`
- 뷰포트가 작아지면 비율 유지 축소
- 뷰포트가 커져도 앱 프레임은 `390 x 844`를 초과하지 않음
- 앱 프레임 외부 영역은 배경색으로 구분

관련 구현 파일:

- `src/main.tsx`
- `src/styles/theme.css`

### 5.2 레이아웃

- 모든 페이지는 `MobileLayout`을 기본 스캐폴드로 사용
- 상단은 `FixedHeader`, 하단 고정 영역은 `FloatingBottom` 또는 `BottomNav` 사용
- 초기 렌더 시 본문 시작점은 헤더 아래 동일 오프셋 규칙 유지
- 페이지별로 `max-w-[390px]`, `mx-auto`를 중복 선언하지 않음

### 5.3 컴포넌트 사용 원칙

- 버튼은 공통 컴포넌트 사용: `AppButton`, `Btn_1Col`, `Btn_2Col`
- 입력은 공통 입력 컴포넌트 우선 사용
- 페이지별 임시 스타일 남발 금지

## 6. API 작업 원칙

API 계층 작업 전 문서 확인:

- `src/api/AGENTS.md`
- `src/api/README.md`

핵심 원칙:

- API 호출은 공통 `apiClient` 기반으로 처리
- 요청/응답 타입을 명시하고 `index.ts` export를 동기화
- 민감 정보 로그 출력 금지

## 7. 작업 체크리스트

- 페이지가 `MobileLayout`을 사용하는가
- 버튼/입력이 공통 컴포넌트 기반인가
- 390x844 프레임 정책이 유지되는가
- 헤더/본문/하단 고정 영역이 충돌하지 않는가
- 변경 사항이 `AGENTS.md`/가이드 문서와 충돌하지 않는가

## 8. 유지보수 정책

레이아웃 또는 디자인 규칙이 바뀌면 아래 문서를 함께 업데이트합니다.

- `frontend/AGENTS.md`
- `frontend/guidelines/DESIGN_SYSTEM.md`
- `frontend/guidelines/LAYOUT_GUIDELINES.md`
