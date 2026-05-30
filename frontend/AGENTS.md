# 프론트엔드 AGENTS 가이드 (NOVA)

이 문서는 `frontend/` 작업 시 따르는 공통 규칙입니다.

참조 문서:

- `guidelines/DESIGN_SYSTEM.md`
- `guidelines/LAYOUT_GUIDELINES.md`
- `src/app/domains/AGENTS.md`

## 1) 목표

- 웹에서도 모바일 앱 같은 일관된 UI/UX를 유지한다.
- 모든 페이지에 공통 레이아웃 규격을 적용한다.
- 임의 스타일보다 디자인 토큰/공통 컴포넌트를 우선 사용한다.

## 2) 문서 우선순위

1. `frontend/AGENTS.md`
2. `frontend/guidelines/DESIGN_SYSTEM.md`
3. `frontend/guidelines/LAYOUT_GUIDELINES.md`
4. 기존 페이지 구현

### 2.1) Codex 실행 정책

- 본 저장소는 별도 브리지 파일을 사용하지 않는다.
- Codex 작업 시 규칙 소스는 `AGENTS.md`, `guidelines/*.md`, `src/app/**/AGENTS.md`만 사용한다.
- `README.md`는 시스템 가이드라인 소스로 취급하지 않는다.

### 2.2) API 작업 규칙 소스 (필수)

- `src/api/*` 파일을 생성/수정하는 작업은 반드시 `src/api/AGENTS.md`를 함께 확인한다.
- API 레이어 구현 규칙(클라이언트 사용, DTO 타입, 에러 처리, export 정책)은 `src/api/AGENTS.md`를 우선 적용한다.
- 본 문서와 `src/api/AGENTS.md`가 충돌하면, API 레이어 범위에서는 `src/api/AGENTS.md`를 우선한다.

## 3) 프레임 규격 (필수)

- 기준 프레임: `390 x 844`
- 프레임 기준 요소: `#root`
- 데스크탑 브라우저(`>768px`)에서는 `390x844` 프레임을 중앙 고정으로 유지한다.
- 모바일/앱 브라우저(`<=768px`)에서는 기기 뷰포트 너비/높이에 맞춰 `#root`를 확장해 사용한다.
- 모바일/앱 브라우저에서는 프레임 스케일 축소를 적용하지 않는다(`--app-scale: 1`).
- 프레임 외부 영역은 별도 배경으로 구분 유지

## 4) 레이아웃 규칙 (필수)

- 모든 페이지는 `MobileLayout`을 기본 스캐폴드로 사용
- 페이지 유형과 관계없이 예외 없이 동일 레이아웃 규격을 적용한다.
- 상단 네비게이션은 `MobileLayout`의 `headerType`으로 관리한다.
  - `headerType="back"`: 뒤로가기 헤더(`FixedHeader`)
  - `headerType="close"`: 닫기 헤더(`CloseFixedHeader`)
  - `headerType="none"`: 버튼 없는 타이틀 헤더(`TitleOnlyFixedHeader`)
- 하단 고정 액션은 `FloatingBottom` 또는 `BottomNav` 사용
- 초기 렌더 시 본문은 헤더 아래에서 시작해야 함
- 페이지 간 본문 시작 오프셋은 동일해야 함
- 스크롤 중 본문이 고정 헤더 뒤로 지나가는 동작은 정상 동작으로 간주
- 페이지별 `max-w-[390px] mx-auto` 중복 선언 금지

## 5) 컴포넌트 규칙

- 상호작용 버튼은 공통 버튼 컴포넌트 사용 (`AppButton`, `Btn_1Col`, `Btn_2Col`)
- 입력 블록은 `CommonInputGroup` 등 공통 입력 컴포넌트 우선
- 임시/일회성 스타일 남발 금지

### 5.1) 상태 관리 규칙

- 프론트엔드에서 상태 관리가 필요한 경우 `zustand`를 표준으로 사용한다.
- 다중 페이지/다중 컴포넌트에서 공유되는 상태는 `zustand store`로 관리한다.
- 임의 전역 객체/직접 `sessionStorage` 접근으로 상태를 분산 관리하지 않는다.

### 5.2) 약관 동의 페이지 규격 (필수)

- 약관 동의 화면은 `src/app/domains/AGENTS.md`의 공통 규격을 사용한다.
- 인증서/여권/생체/계좌 약관 정의는 각 도메인 폴더(`certificate-consent`, `verification-consent`, `account-consent`)의 정의 파일을 사용한다.
- 약관 데이터는 `ConsentDefinition` 스키마를 사용한다.
- 페이지 컴포넌트 내부에 약관 텍스트를 하드코딩하지 않는다.
- 동의/아코디언/캐러셀 상태는 `storage.ts` API만 사용한다.
- `sessionStorage` 직접 접근 금지.
- 세부 체크 아이콘 규칙:
  - 체크됨 상태 클릭: 해제
  - 미체크 상태 클릭: 상세 페이지 이동 후 동의
- 큰 카테고리 체크 아이콘 규칙:
  - 모든 세부가 체크됨: 전체 해제
  - 하나라도 미체크: 카테고리 동의 플로우 진입
- 세부 1개 카테고리 버튼 텍스트: `동의하기`
- 세부 2개 이상 카테고리 버튼 텍스트: `모두 동의하기`
- 단건 상세 페이지 하단 버튼 텍스트는 항상 `동의하기`로 유지한다.
- 캐러셀 페이지 버튼(큰 카테고리 체크 아이콘으로 진입하는 다건 상세 슬라이드 페이지의 하단 고정 버튼) 텍스트는 항상 `모두 동의하기`로 유지한다.
- 카테고리 전체 동의 캐러셀은 진입 시 항상 1번(첫 상세)부터 시작한다.
- 약관 메인 페이지(`/consent-template`)는 "외부에서 신규 진입"할 때 상태를 초기화한다.
- 약관 플로우 내부 이동(상세/캐러셀 이동, 브라우저 뒤로가기, 닫기 버튼 복귀)으로 메인 페이지에 돌아올 때는 상태를 유지한다.
- 내부 복귀/외부 신규 진입 구분은 라우트 상태 플래그(`preserveConsentState`) 기준으로 처리한다.
- 약관 동의 페이지 신규 요청 시 아래를 먼저 확인하고 구현한다:
  - 선택 카테고리 개수
  - 각 카테고리(필수/선택)의 세부 약관 개수

## 6) 검증 체크리스트

- [ ] 데스크탑(`>768px`)에서 `390x844` 중앙 고정 프레임 유지
- [ ] 모바일/앱 브라우저(`<=768px`)에서 기기 뷰포트 기준 렌더링
- [ ] 모바일/앱 브라우저에서 `--app-scale: 1` 유지
- [ ] 헤더/본문/하단 고정 영역 겹침 없음
- [ ] 공통 레이아웃 컴포넌트 일관 사용
- [ ] 페이지별 프레임 중복 규칙 없음
- [ ] 약관 샘플 페이지는 `src/app/domains/AGENTS.md`의 완료 기준을 모두 충족

## 7) 파일 책임 범위

- 프레임/스케일: `src/main.tsx`, `src/styles/theme.css`
- 공통 레이아웃: `src/app/components/layout/*`
- 페이지 구현: `src/app/pages/*`
- 디자인 시스템: `src/app/components/design-system/*`
- API 레이어: `src/api/*` (`src/api/AGENTS.md` 규칙 필수 적용)

### 7.1) API 개발 가이드라인 (필수)

목적:
- 프론트엔드 API 연동 시 계약 일관성, 보안, 유지보수성을 보장한다.

적용 대상:
- `src/api/*` 내 신규/수정 작업
- 페이지/도메인에서 API 호출 흐름을 연결하는 작업

필수 규칙:
- API 호출은 `src/api/client.ts`의 `apiClient`를 사용하고, raw `axios` 인스턴스를 새로 만들지 않는다.
- 엔드포인트 함수마다 요청/응답 DTO 타입을 명시하고 `any` 사용을 최소화한다.
- envelope 응답 구조는 `response.data.data` 기준으로 일관되게 반환한다.
- 신규 엔드포인트 추가 시 `src/api/index.ts` export를 반드시 갱신한다.
- UI 상태 변경/라우팅 로직은 API 모듈에 넣지 않고 페이지/서비스 레이어에서 처리한다.
- 시크릿/토큰/고정 자격증명은 코드와 로그에 남기지 않고 환경변수/보안 경로로만 처리한다.

AI 실행 체크리스트:
- [ ] 작업 시작 전에 `src/api/AGENTS.md`를 확인했는가
- [ ] 새 API가 `apiClient`를 사용했는가
- [ ] 요청/응답 DTO 타입이 정의되었는가
- [ ] `src/api/index.ts` export가 갱신되었는가
- [ ] 4xx/5xx 실패 경로를 호출부에서 처리했는가
- [ ] 민감 정보 로그가 없는가

### 7.2) 서비스 도메인 폴더 작업 원칙

- 하나의 서비스 기능에서 여러 페이지가 필요한지 먼저 확인한다.
- 이미 해당 서비스 도메인 폴더가 있으면 그 폴더에서 작업한다.
- 관련 서비스 도메인 폴더가 없고 다중 페이지 기능이면 서비스 도메인 폴더를 먼저 만들고 그 안에서 작업한다.
- 서비스 도메인 예시:
  - `LoginService`
  - `CertificateIssueService`
  - `TransferService`

### 7.3) domains 폴더 역할

- `src/app/domains/*`는 공통으로 재사용되는 페이지 규격 파일을 관리한다.
- 새로운 공통 페이지를 만들 때 정의해야 할 규격(예: 스키마, 상태 저장, 샘플 정의)이 있으면 해당 서비스 도메인 폴더에 파일을 생성한다.
- 페이지 UI 파일(`pages/*`)과 규격 파일(`domains/*`)을 분리해 유지한다.


### 7.4) Main 페이지 컴포넌트 분리 원칙 (필수)

- `src/app/pages/Main.tsx`에 새로운 UI 블록/기능 컴포넌트를 직접 추가하지 않는다.
- Main 페이지 변경 시 신규 요소는 `src/app/pages/main/` 하위의 별도 컴포넌트 파일로 분리해 구현한다.
- `Main.tsx`는 페이지 조립 전용 파일로 유지하고, 상태 조회/이벤트 핸들러/라우팅 연결만 담당한다.
- 공통 타입이 필요하면 `src/app/pages/main/types.ts`로 분리해 재사용한다.
- 한 파일에 과도한 마크업이 다시 쌓이지 않도록 기능 단위 컴포넌트 분리를 기본값으로 한다.
## 8) 동기화 정책

레이아웃/디자인 규칙 변경 시 아래 문서를 함께 갱신한다.

- `frontend/AGENTS.md`
- `frontend/guidelines/DESIGN_SYSTEM.md`
- `frontend/guidelines/LAYOUT_GUIDELINES.md`

## 9) 헤더 구현 입력 계약 (필수)

페이지 헤더를 구현/수정할 때는 코딩 전에 요청에서 필요한 값을 먼저 수집한다.

사전 확인 필수 항목:

- 헤더 타입: `back` / `close` / `none`
- 헤더 타이틀 텍스트
- 이동 정책:
  - `back` 헤더: 커스텀 로직(`onBack`) 사용 여부 또는 `backPath`
  - `close` 헤더: 커스텀 로직(`onClose`) 사용 여부 또는 `closePath`
- 색상 토큰 또는 명시값:
  - `headerBackgroundColor`
  - `headerTextColor`
- 하단 액션 영역 사용 여부:
  - `bottomContent` 필요 여부
  - `bottomBackgroundColor` (플로팅 하단 사용 시)

위 항목이 누락되어 안전하게 추론할 수 없으면, 반드시 사용자에게 먼저 확인한 뒤 구현한다.

### 기본 기본값

- `headerType`: `back`
- `headerBackgroundColor`: `#ffffff`
- `headerTextColor`: `#000000`
- `bottomBackgroundColor`: `#ffffff`
- 뒤로가기 기본 동작: `navigate(-1)`
- 닫기 기본 동작: `/`

### PR/리뷰 체크리스트 추가 항목

- [ ] 페이지 의도에 맞게 헤더 타입을 명시적으로 선택했는가
- [ ] 이동 목적지(`backPath`/`closePath`)가 플로우 스펙과 일치하는가
- [ ] 헤더 색상 값이 확인되었거나 기본값으로 고정되었는가
- [ ] 플로팅 하단 사용 시 `bottomBackgroundColor`가 확인되었거나 기본값으로 고정되었는가
- [ ] 공통 헤더로 처리 가능한 버튼을 페이지별 임시 버튼으로 중복 구현하지 않았는가

## 10) 공통 상태 페이지 구현 규칙 (필수)

대상 컴포넌트:

- `Loading`
- `Success`
- `Failed`
- `CenteredTaskContent`

규칙:

- 콘텐츠 본문 정렬은 `CenteredTaskContent`를 재사용한다.
- `task`, `description` 텍스트는 페이지별 하드코딩 레이아웃을 만들지 말고 공통 컴포넌트 props로 전달한다.
- `description`은 줄바꿈 문자열(`\n`, `\\n`)을 표시할 수 있어야 한다.

성공/실패 시각 요소 확장 규칙:

- `visualImageSrc`가 전달되면 이미지 우선 렌더링
- `visualImageSrc`가 없으면 기본 아이콘 렌더링
- `visualImageAlt`를 함께 전달해 접근성을 유지한다.

사전 확인 필수 항목(요청 시):

- `task`, `description`
- 버튼 동작(`onButtonClick` 또는 `redirectPath`)
- 이미지 대체 여부(`visualImageSrc`, `visualImageAlt`)

## 11) 약관 동의 컴포넌트 규칙 (필수)

현재 약관 동의 기능은 페이지 직접 구현이 아니라 컴포넌트 조립 방식으로 사용한다.

핵심 컴포넌트:

- `ConsentOverviewAccordion`
- `ConsentTermDetailView`
- `ConsentCategoryCarouselView`

상태 관리:

- 약관 상태는 `zustand`(`domains/storage.ts`)를 사용한다.
- 컴포넌트 외부에서 `sessionStorage`를 직접 조작하지 않는다.

진입/복귀 규칙:

- 뒤로가기 복귀가 아닌 신규 진입 시 상태를 초기화한다.
- 신규 진입 시 필수 카테고리만 펼친다.
- 상세/캐러셀에서 메인으로 돌아올 때는 상태를 유지한다.

상세/캐러셀 규칙:

- 단건 상세(`ConsentTermDetailView`)는 캐러셀이 아니며 페이지 수 표시를 하지 않는다.
- 카테고리 상세(`ConsentCategoryCarouselView`)는 캐러셀을 수행하고 `1/n` 표시를 한다.
- 카테고리 캐러셀 재진입 시 시작 지점은 항상 1페이지(인덱스 0)다.

선택 UI 옵션:

- 페이지에 따라 선택(체크) UI는 있을 수도, 없을 수도 있다.
- 선택 UI가 없는 경우 `showSelectionControls={false}`로 처리한다.

헤더 규칙:

- 상세 헤더 타이틀은 항상 `약관/동의서 상세`를 사용한다.

폐기 규칙:

- 약관 페이지에서 UI/상태/이동 로직을 페이지 파일에 중복 구현하는 방식은 더 이상 사용하지 않는다.

정의 파일 연결 규칙:

- 약관 데이터는 페이지에 하드코딩하지 않고 정의 파일에서 관리한다.
- 권장 위치: `src/app/domains/<service-domain>/`
- 권장 파일명: `definition.<domain-or-scenario>.ts`
  - 예: `definition.certificate.ts`, `definition.liveness-consent.ts`, `definition.open-account.ts`
- 페이지는 목적에 맞는 정의 파일을 import해서 `definition` props로 주입한다.

## 12) 헤더 뒤로가기 정책 (스텝형 플로우 필수)

- 스텝형 플로우(예: 인증서 발급)에서는 `navigate(-1)`을 뒤로가기 기본 동작으로 사용하지 않는다.
- 각 스텝 페이지는 `MobileLayout`의 `backPath`를 명시하고, 현재 스텝 기준 이전 스텝 경로로 이동해야 한다.
- 히스토리 기반 이동이 필요한 예외 케이스는 `onBack`을 사용하되, 예외 사유를 PR 설명에 반드시 남긴다.
- 템플릿 기반 페이지(`Failed` 등)도 스텝형 플로우에 포함될 경우 `backPath`를 받아 동일 정책을 따른다.

## 13) 라우팅 구조 규칙 (필수)

목적:
- `routes.tsx` 단일 파일 충돌을 줄이고, 도메인별 병렬 개발 시 머지 충돌 비용을 낮춘다.

규칙:
- 신규/변경 라우트는 `src/app/routes/` 하위의 도메인 라우트 파일에서만 작업한다.
  - 예: `mainRoutes.tsx`, `walletRoutes.tsx`, `certificateRoutes.tsx`, `jobRoutes.tsx`
- 각 도메인 라우트 파일은 `RouteObject[]`를 export 한다.
- `src/app/routes/index.ts`에서 도메인 라우트들을 import 하여 `appRoutes`로 병합한다.
- `src/app/routes.tsx`는 라우트 정의를 직접 갖지 않고, `appRoutes`를 받아 `createBrowserRouter(appRoutes)`만 수행한다.
- import 경로 충돌 방지를 위해 `routes.tsx`에서는 `./routes/index`를 명시적으로 import 한다.

폴백 규칙:
- `NotFound` 같은 fallback 라우트(`{ path: "*", ... }`)는 반드시 `appRoutes`의 마지막에 추가한다.
- fallback 라우트보다 뒤에 일반 라우트를 배치하지 않는다.

체크리스트(PR/리뷰):
- [ ] 도메인 라우트 파일에서만 신규 경로를 추가/수정했는가
- [ ] `routes/index.ts`에서 도메인 라우트 병합을 반영했는가
- [ ] `routes.tsx`는 조립 전용(얇은 파일) 상태를 유지하는가
- [ ] `*` fallback 라우트가 배열 마지막에 위치하는가

## 14) 문서 수정 안전 규칙 (인코딩/누락 방지)

### 14.1 목적
- 한글 깨짐(인코딩 손상), 문서 누락, 범위 외 수정, 언어 혼용(영문 본문) 문제를 방지한다.
- 본 규칙은 이 저장소에서 수행되는 모든 문서 수정 작업에 공통 적용한다.
- 기존 대화/신규 대화 여부와 무관하게 동일하게 준수한다.

### 14.2 PowerShell UTF-8 기본 설정(권장)
- PowerShell 프로필(`$PROFILE`)에 아래를 설정해 기본 인코딩을 UTF-8로 고정한다.

```powershell
[Console]::InputEncoding  = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding           = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['Out-File:Encoding']    = 'utf8'
$PSDefaultParameterValues['Set-Content:Encoding'] = 'utf8'
$PSDefaultParameterValues['Add-Content:Encoding'] = 'utf8'
$PSDefaultParameterValues['Export-Csv:Encoding']  = 'utf8'
```

### 14.3 수정 방식 규칙(필수)
- 문서 수정은 부분 패치(`apply_patch`) 우선으로 수행한다.
- 한글 문서를 통째 재작성(`Set-Content` 전체 덮어쓰기)하지 않는다.
- 요청된 경로 범위를 벗어난 문서는 수정하지 않는다.
- 문서 본문은 한국어로 작성한다(코드, 경로, 라이브러리/타입명 제외).

### 14.4 복구 규칙(필수)
- 깨짐/누락이 의심되면 새로 쓰지 않고, 우선 Git 원복(`git restore`) 후 최소 변경만 다시 적용한다.
- 인코딩 변환 작업은 단독 변경 단위로 분리해 추적 가능하게 한다.

### 14.5 검증 규칙(필수)
- 완료 전 아래를 반드시 확인한다.
1. `rg`로 주요 한글 키워드 검색이 정상 동작하는가
2. `git diff`에서 의도하지 않은 대량 삭제/섹션 누락이 없는가
3. 신규 추가 문구가 한국어 기준을 만족하는가
