# 프론트엔드 AGENTS 가이드 (NOVA)

이 문서는 `frontend/` 작업 시 따르는 공통 규칙입니다.

참조 문서:
- `guidelines/DESIGN_SYSTEM.md`
- `guidelines/LAYOUT_GUIDELINES.md`

## 1) 목표
- 웹에서도 모바일 앱 같은 일관된 UI/UX를 유지한다.
- 모든 페이지에 공통 레이아웃 규격을 적용한다.
- 임의 스타일보다 디자인 토큰/공통 컴포넌트를 우선 사용한다.

## 2) 문서 우선순위
1. `frontend/AGENTS.md`
2. `frontend/guidelines/DESIGN_SYSTEM.md`
3. `frontend/guidelines/LAYOUT_GUIDELINES.md`
4. 기존 페이지 구현

## 2.1) Codex 실행 정책
- 본 저장소는 별도 브리지 파일을 사용하지 않는다.
- Codex 작업 시 규칙 소스는 `AGENTS.md`와 `guidelines/*.md`만 사용한다.

## 3) 프레임 규격 (필수)
- 기준 프레임: `390 x 844`
- 프레임 기준 요소: `#root`
- 화면이 작아지면 비율 유지 축소
- 화면이 커져도 `390x844` 이상 확장 금지
- 프레임 외부 영역은 별도 배경으로 구분 유지

## 4) 레이아웃 규칙 (필수)
- 모든 페이지는 `MobileLayout`을 기본 스캐폴드로 사용
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

## 5.2) 상태 관리 규칙
- 프론트엔드에서 상태 관리가 필요한 경우 `zustand`를 표준으로 사용한다.
- 다중 페이지/다중 컴포넌트에서 공유되는 상태는 `zustand store`로 관리한다.
- 임의 전역 객체/직접 `sessionStorage` 접근으로 상태를 분산 관리하지 않는다.

## 5.1) 약관 동의 페이지 규격 (필수)
- 인증서 약관 동의 화면은 `src/app/domains/certificate-consent/` 규격을 사용한다.
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
- [ ] `390x844` 프레임 규칙 유지
- [ ] 작은 화면에서 비율 유지 축소 동작 확인
- [ ] 헤더/본문/하단 고정 영역 겹침 없음
- [ ] 공통 레이아웃 컴포넌트 일관 사용
- [ ] 페이지별 프레임 중복 규칙 없음
- [ ] 약관 샘플 페이지는 `src/app/domains/certificate-consent/README.md`의 완료 기준을 모두 충족

## 7) 파일 책임 범위
- 프레임/스케일: `src/main.tsx`, `src/styles/theme.css`
- 공통 레이아웃: `src/app/components/layout/*`
- 페이지 구현: `src/app/pages/*`
- 디자인 시스템: `src/app/components/design-system/*`

## 7.1) 서비스 도메인 폴더 작업 원칙
- 하나의 서비스 기능에서 여러 페이지가 필요한지 먼저 확인한다.
- 이미 해당 서비스 도메인 폴더가 있으면 그 폴더에서 작업한다.
- 관련 서비스 도메인 폴더가 없고 다중 페이지 기능이면 서비스 도메인 폴더를 먼저 만들고 그 안에서 작업한다.
- 서비스 도메인 예시:
  - `LoginService`
  - `CertificateIssueService`
  - `TransferService`

## 7.2) domains 폴더 역할
- `src/app/domains/*`는 공통으로 재사용되는 페이지 규격 파일을 관리한다.
- 새로운 공통 페이지를 만들 때 정의해야 할 규격(예: 스키마, 상태 저장, 샘플 정의)이 있으면 해당 서비스 도메인 폴더에 파일을 생성한다.
- 페이지 UI 파일(`pages/*`)과 규격 파일(`domains/*`)을 분리해 유지한다.

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
