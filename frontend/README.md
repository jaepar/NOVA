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
- Zustand

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

운영 원칙:
- 이 README는 온보딩/요약 문서다.
- 구현 시 최종 판단 기준은 `frontend/AGENTS.md`를 따른다.

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

## 8. 핵심 개발 규칙
### 8.1 프레임/반응형
- 기준 프레임은 `390 x 844`
- 뷰포트가 작아지면 비율 유지 축소
- 뷰포트가 커져도 앱 프레임은 `390 x 844`를 초과하지 않음
- 앱 프레임 외부 영역은 배경색으로 구분

관련 구현 파일:
- `src/main.tsx`
- `src/styles/theme.css`

### 8.2 레이아웃
- 모든 페이지는 `MobileLayout`을 기본 스캐폴드로 사용
- 상단 헤더는 `MobileLayout`의 `headerType`으로 선택
  - `back`: 뒤로가기 헤더 (`FixedHeader`)
  - `close`: 닫기 헤더 (`CloseFixedHeader`)
  - `none`: 버튼 없는 타이틀 헤더 (`TitleOnlyFixedHeader`)
- 하단 고정 영역은 `FloatingBottom` 또는 `BottomNav` 사용
- 초기 렌더 시 본문 시작점은 헤더 아래 동일 오프셋 규칙 유지
- 페이지별 `max-w-[390px]`, `mx-auto` 중복 선언 금지

### 8.3 컴포넌트 사용 원칙
- 버튼은 공통 컴포넌트 우선 사용: `AppButton`, `Btn_1Col`, `Btn_2Col`
- 입력은 공통 입력 컴포넌트 우선 사용
- 페이지별 임시 스타일 남발 금지

## 9. 작업 체크리스트
- 페이지가 `MobileLayout`을 사용하는가
- 버튼/입력이 공통 컴포넌트 기반인가
- `390x844` 프레임 정책이 유지되는가
- 헤더/본문/하단 고정 영역이 충돌하지 않는가
- 변경 사항이 `AGENTS.md`/가이드 문서와 충돌하지 않는가

## 10. 약관 동의 규격
인증서 약관 동의 페이지는 아래 규격을 사용한다.

- `src/app/domains/certificate-consent/spec.ts`
- `src/app/domains/certificate-consent/storage.ts`
- `src/app/domains/certificate-consent/README.md`

팀 규칙:
- 약관 데이터는 `ConsentDefinition` 스키마로 정의
- 약관 텍스트를 페이지 컴포넌트에 직접 하드코딩하지 않음
- 동의/아코디언/캐러셀 상태는 `storage.ts` API만 사용

## 11. 헤더/하단 액션 사용 가이드
페이지 헤더와 하단 고정 액션은 `MobileLayout`을 단일 진입점으로 사용한다.

- 뒤로가기 클릭 우선순위: `onBack` -> `backPath` -> `navigate(-1)`
- 닫기 클릭 우선순위: `onClose` -> `closePath` -> `/`
- 단계형 페이지: `headerType="back"` + `backPath`
- 모달 성격 흐름: `headerType="close"` + `closePath`
- 진입/웰컴 페이지: `headerType="none"`
- 하단 CTA 고정 페이지: `bottomContent` 사용

### 11.1 헤더 타입
- `headerType="back"`: 뒤로가기 버튼 헤더 (`FixedHeader`)
- `headerType="close"`: 닫기 버튼 헤더 (`CloseFixedHeader`)
- `headerType="none"`: 좌우 버튼 없는 타이틀 헤더 (`TitleOnlyFixedHeader`)

### 11.2 MobileLayout 헤더/하단 옵션
- `title: string` (required)
- `headerType?: 'back' | 'close' | 'none'` (default: `back`)
- `onBack?: () => void`
- `backPath?: string`
- `onClose?: () => void`
- `closePath?: string`
- `headerBackgroundColor?: string` (default: `#ffffff`)
- `headerTextColor?: string` (default: `#000000`)
- `bottomContent?: ReactNode`
- `bottomBackgroundColor?: string` (default: `#ffffff`)

### 11.3 예시
```tsx
<MobileLayout
  title="Step 2"
  headerType="back"
  backPath="/step-1"
  headerBackgroundColor="#ffffff"
  headerTextColor="#000000"
  bottomContent={<Btn_1Col>다음</Btn_1Col>}
  bottomBackgroundColor="#ffffff"
>
  ...
</MobileLayout>
```

## 12. 공통 상태 페이지(로딩/성공/실패) 사용 가이드

### 12.1 공통 콘텐츠 컴포넌트
- `CenteredTaskContent`를 사용해 콘텐츠를 화면 기준 가로/세로 중앙 정렬한다.
- `task`, `description`을 파라미터로 전달한다.
- `description`은 `\n` 또는 `\\n` 개행 문자열을 줄바꿈으로 렌더링한다.

### 12.2 Loading 컴포넌트 파라미터
- `headerTitle: string`
- `task: string`
- `description?: string`
- `spinnerSize?: 'sm' | 'md' | 'lg'`

예시:
```tsx
<Loading
  headerTitle="Template"
  task="Task"
  description={"안녕\n하세요"}
  spinnerSize="lg"
/>
```

### 12.3 Success 컴포넌트 파라미터
- `headerTitle: string`
- `task: string`
- `description?: string`
- `visualImageSrc?: string`
- `visualImageAlt?: string`
- `buttonText?: string`
- `onButtonClick?: () => void`
- `redirectPath?: string`

렌더링 규칙:
- `visualImageSrc`가 있으면 이미지 렌더링
- `visualImageSrc`가 없으면 기본 성공 아이콘 렌더링

예시:
```tsx
<Success
  headerTitle="완료"
  task="계좌 개설 완료"
  description={"정상 처리되었습니다.\n메인으로 이동합니다."}
  visualImageSrc="/images/success.png"
  visualImageAlt="성공"
  redirectPath="/main"
/>
```

### 12.4 Failed 컴포넌트 파라미터
- `headerTitle: string`
- `task: string`
- `description?: string`
- `visualImageSrc?: string`
- `visualImageAlt?: string`
- `buttonText?: string`
- `onButtonClick?: () => void`
- `redirectPath?: string`

렌더링 규칙:
- `visualImageSrc`가 있으면 이미지 렌더링
- `visualImageSrc`가 없으면 기본 실패 아이콘 렌더링

예시:
```tsx
<Failed
  headerTitle="실패"
  task="인증 실패"
  description={"입력 정보를 확인한 뒤\n다시 시도해주세요."}
  visualImageSrc="/images/failed.png"
  visualImageAlt="실패"
  redirectPath="/"
/>
```

## 13. 약관 동의 컴포넌트 사용 가이드

약관 동의 기능은 샘플 페이지 내부에서 공통 컴포넌트를 조립해 사용한다.

### 13.1 컴포넌트 목록
- `ConsentOverviewAccordion`: 메인 약관 아코디언
- `ConsentTermDetailView`: 세부 약관 단건 상세
- `ConsentCategoryCarouselView`: 주요 약관 체크 시 진입하는 캐러셀 상세

### 13.2 공통 동작 요약
- 상태 관리는 `zustand`(`domains/certificate-consent/storage.ts`)를 사용한다.
- 신규 진입 시 상태 초기화, 복귀 시 상태 유지
- 상세 헤더 타이틀은 `약관/동의서 상세` 고정
- 카테고리 캐러셀 재진입 시 시작은 항상 1페이지

### 13.3 파라미터

`ConsentOverviewAccordion`
- `definition: ConsentDefinition`
- `preserveState: boolean`
- `showSelectionControls?: boolean`
- `onRequiredCompleteChange?: (complete: boolean) => void`

`ConsentTermDetailView`
- `definition: ConsentDefinition`
- `termId?: string`
- `showSelectionControls?: boolean`

`ConsentCategoryCarouselView`
- `definition: ConsentDefinition`
- `categoryId?: string`
- `showSelectionControls?: boolean`

### 13.4 사용 예시
```tsx
<ConsentOverviewAccordion
  definition={certificateConsentDefinitionSample}
  preserveState={preserveState}
  onRequiredCompleteChange={setIsRequiredComplete}
/>
```

```tsx
<ConsentTermDetailView
  definition={certificateConsentDefinitionSample}
  termId={termId}
/>
```

```tsx
<ConsentCategoryCarouselView
  definition={certificateConsentDefinitionSample}
  categoryId={categoryId}
/>
```

### 13.5 약관 정의 파일 네이밍/연결 규칙
- 약관 데이터는 페이지에 직접 작성하지 않고 정의 파일에서 관리한다.
- 권장 경로: `src/app/domains/<service-domain>/`
- 권장 파일명: `definition.<scenario>.ts`
  - 예: `definition.issue-account.ts`
  - 예: `definition.wallet.ts`

페이지 연결 예시:
```tsx
import { issueAccountConsentDefinition } from "../../domains/certificate-consent/definition.issue-account";

<ConsentOverviewAccordion
  definition={issueAccountConsentDefinition}
  preserveState={preserveState}
/>
```
