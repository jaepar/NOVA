# 디자인 시스템 가이드

## 1) 범위

이 문서는 NOVA 프론트엔드의 공통 UI 규칙을 정의한다.

상위 참조:

- `frontend/AGENTS.md`
- `frontend/guidelines/LAYOUT_GUIDELINES.md`

## 2) 핵심 토큰

- 기준 프레임: `390 x 844`
- 브레이크포인트 기준: `768px`
- 데스크탑(`>768px`)은 중앙 `390x844` 프레임, 모바일/앱 브라우저(`<=768px`)는 기기 뷰포트 기준 렌더링
- 좌우 기본 패딩: `px-5` (20px)
- Primary: `#003CA6`
- Primary Dark: `#002A73`
- Primary Light: `#2563EB`
- Primary Soft: `#EAF3FF`
- 본문 텍스트: `#1F2937`
- 보조 텍스트: `#6B7280`
- Border: `#E5E7EB`
- 배경: `#FFFFFF`

## 3) 타이포그래피

- 기본 폰트: `Inter`
- 보조 폰트: `Urbanist`
- 크기 스케일:
  - `--text-2xl`: 24px
  - `--text-xl`: 20px
  - `--text-lg`: 18px
  - `--text-base`: 16px
  - `--text-sm`: 14px
  - `--text-xs`: 12px

## 4) 버튼 시스템 (필수)

- 모든 상호작용 버튼은 공통 버튼 컴포넌트를 사용한다.
- 사용 컴포넌트:
  - `AppButton`: 범용 버튼 래퍼
  - `Btn_1Col`: 전체 폭 CTA
  - `Btn_2Col`: 2열 CTA
- 페이지에서 직접 `<button>` 스타일링으로 대체하지 않는다.
- 텍스트/상태/동작은 props로 제어한다.

## 5) 입력 시스템

- `CommonInputGroup` 등 공통 입력 컴포넌트를 우선 사용한다.
- 공통 컴포넌트가 존재하면 임의 입력 스타일을 추가하지 않는다.

### 5.1) 이메일 인증 입력 규격

- 이메일 인증 플로우는 공통 컴포넌트 조합을 표준으로 사용한다.
  - `EmailVerificationFields`: 이메일 입력, 인증번호 입력, 상태 메시지 UI
  - `useEmailVerification`: 인증번호 발송, 타이머, 검증 상태 로직
- 회원가입, 계좌개설, 해외송금 페이지에서 동일 인증 UI를 각각 다시 구현하지 않는다.
- 페이지는 인증 시작 조건, 완료 후 이동, 보조 문구만 조합하고 인증 자체 UI는 공통 블록을 사용한다.

### 5.2) 국가 선택 입력 규격

- 국가 검색/선택은 `CountrySelectBottomSheet`를 공통 컴포넌트로 사용한다.
- 구성 규격:
  - 상단: 제목 + 닫기 버튼
  - 검색창: 라벨 없이 placeholder만 사용
  - 검색창 위치: 상단 고정
  - 리스트 영역: 하단 목록만 스크롤
- 페이지에서 국가 검색 로직, 검색창, 리스트 아이템 UI를 반복 구현하지 않는다.
- 국가 데이터는 `data` 폴더 정의 파일을 주입받아 사용한다.

### 5.3) 2분할 선택 박스 규격

- 2개의 선택지 중 하나를 고르는 분할형 선택 UI는 `SegmentedOptionField`를 공통 사용한다.
- 기본 규격:
  - 레이아웃: `2열`, `rounded-2xl`, `border border-border`, `bg-background`
  - 선택 상태: `bg-primary/10`, `text-primary`, `font-semibold`
  - 비선택 상태: `text-foreground`
  - 구분선: 두 번째 옵션 시작 지점에 `border-l border-border`
- 페이지에서 동일 박스 구조를 직접 반복 구현하지 않는다.
- 특정 기능 전용 컴포넌트로 보지 않고, 2개의 상호 배타 옵션을 보여주는 모든 화면에서 공통 선택 패턴으로 사용한다.

## 6) 공통 레이아웃 컴포넌트

- `FixedHeader`
- `CloseFixedHeader`
- `TitleOnlyFixedHeader`
- `MobileLayout`
- `FloatingBottom`
- `BottomNav`
- `BottomSheet`

### 레이아웃 적용 범위

- 모든 페이지는 예외 없이 공통 레이아웃 규격(`MobileLayout` + 동일 헤더/본문/하단 구조)을 따른다.
- 신규 페이지도 동일 규격을 기본값으로 적용하며, 페이지별 독자 프레임 규칙을 추가하지 않는다.

### 헤더 선택 규칙

- 페이지에서는 헤더 컴포넌트를 직접 조합하기보다 `MobileLayout`의 `headerType`을 우선 사용한다.
- `headerType="back"`: 뒤로가기 아이콘 헤더
- `headerType="close"`: 닫기 아이콘 헤더
- `headerType="none"`: 아이콘 없는 타이틀 헤더

### 하단 액션 규칙

- 하단 고정 액션은 `MobileLayout`의 `bottomContent`로 구성한다.
- 하단 배경색은 `bottomBackgroundColor`로 제어하며 기본값은 `#ffffff`이다.

## 6.1) 토스트 시스템 (필수)

- 토스트 메시지는 디자인 시스템 컴포넌트/유틸을 사용한다.
- 사용 컴포넌트:
  - `NovaToast`: 전역 토스트 렌더러 (`App.tsx` 루트에 1회 마운트)
  - `novaToast`: 페이지/도메인에서 호출하는 공통 API
- 직접 `sonner`의 `toast`를 페이지에서 import해 호출하지 않는다.
- 기본 규격:
  - 위치: `top-center`
  - 지속시간: `2500ms`
  - 모서리 반경: `12px`
  - 본문 크기/두께: `14px` / `500`
- 상태 타입:
  - 성공: `novaToast.success(message)`
  - 오류: `novaToast.error(message)`
  - 정보: `novaToast.info(message)`
  - 경고: `novaToast.warning(message)`

## 6.2) 인라인 배너 시스템 (필수)

- 페이지 내 안내 배너는 공통 컴포넌트 `InlineBanner`를 사용한다.
- 페이지 파일에서 배경/보더 스타일을 직접 작성해 중복 구현하지 않는다.
- 기본 레이아웃 규격:
  - 모서리 반경: `rounded-xl`
  - 내부 여백: `p-3`
  - 텍스트: `text-sm`, `text-center`
- 상태 타입:
  - 성공: `variant="success"`
  - 오류: `variant="error"`
  - 정보: `variant="info"`
  - 경고: `variant="warning"`
- 상태별 색상 규격:
  - 성공: `border-emerald-400/60`, `bg-emerald-500/10`, `text-emerald-900`
  - 오류: `border-red-400/50`, `bg-red-500/10`, `text-black`
  - 정보: `border-primary-light/60`, `bg-primary-soft`, `text-primary`
  - 경고: `border-amber-400/60`, `bg-amber-500/15`, `text-amber-900`
- 접근성 규격:
  - `role="alert"`
  - `aria-live="polite"`

### Main 페이지 구현 정책 참조

- `Main.tsx` 구조 규칙은 디자인 토큰 규칙과 별도로 관리한다.
- Main 페이지 신규 UI는 `src/app/pages/main/` 하위 컴포넌트로 분리하고, `Main.tsx`는 조립 전용으로 유지한다.
- 상세 구현 규칙은 `frontend/AGENTS.md`와 `frontend/guidelines/LAYOUT_GUIDELINES.md`를 따른다.

## 7) 상호작용 원칙

- hover/active 동작은 기존 variant 규칙과 일치시킨다.
- 공통 컴포넌트 규칙과 충돌하는 페이지별 예외 스타일을 만들지 않는다.
- 페이지 간 간격 리듬을 유지한다.

## 8) 준수 체크리스트

- [ ] 공통 레이아웃 스캐폴드 사용
- [ ] 공통 버튼 컴포넌트 사용
- [ ] 공통 입력 컴포넌트 우선 사용
- [ ] 프레임/간격 규칙 유지
- [ ] 명시적 사유 없는 예외 스타일 없음

## 9) 동기화 정책

디자인 규칙 변경 시 아래 문서를 함께 갱신한다.

- `frontend/AGENTS.md`
- `frontend/guidelines/DESIGN_SYSTEM.md`
- `frontend/guidelines/LAYOUT_GUIDELINES.md`

## 10) 약관 동의 UI 규칙

- 약관 동의 페이지의 하단 액션은 공통 하단 고정 버튼(`Btn_1Col`)을 사용한다.
- 큰 카테고리/세부 항목의 체크/이동 인터랙션은 `frontend/src/app/domains/certificate-consent/README.md` 규격을 따른다.
- 세부 약관 상세의 헤더 타이틀은 `약관/동의서 상세`로 통일한다.

## 11) 공통 상태 콘텐츠 규칙

- `Loading`, `Success`, `Failed`의 본문 레이아웃은 `CenteredTaskContent`를 공통 사용한다.
- 공통 본문은 화면 기준 가로/세로 중앙 정렬을 유지한다.
- `task`, `description` 텍스트 블록 스타일은 세 상태 페이지에서 일관되게 유지한다.
- `description`은 줄바꿈 문자열(`\n`, `\\n`)을 표현해야 한다.

성공/실패 시각 요소 규칙:

- `visualImageSrc`가 있으면 이미지 렌더링
- `visualImageSrc`가 없으면 기본 아이콘 렌더링
- 이미지 사용 시 `visualImageAlt`를 제공한다.

## 12) 약관 동의 컴포넌트 구조

- 약관 동의 기능은 아래 컴포넌트 조합을 표준으로 사용한다.
  - `ConsentOverviewAccordion`: 메인 아코디언
  - `ConsentTermDetailView`: 단건 상세
  - `ConsentCategoryCarouselView`: 카테고리 단위 캐러셀 상세

- `필수/선택`은 컴포넌트 분기값이 아니라 데이터(`required`)로 처리한다.
- 캐러셀 여부는 진입 경로로 구분한다.
  - 주요 체크 진입: 캐러셀 상세
  - 세부 체크 진입: 단건 상세

- 이전처럼 약관 페이지별로 동일 UI를 반복 구현하는 방식은 사용하지 않는다.

약관 정의 데이터 소스 규칙:

- 약관 데이터는 정의 파일(`definition.*.ts`)에서 관리하고 컴포넌트에 주입한다.
- 정의 파일 권장 경로: `src/app/domains/<service-domain>/`
- 정의 파일 권장 네이밍: `definition.<scenario>.ts`

## 13) 헤더 뒤로가기 정책 (스텝형 플로우 필수)

- 스텝형 플로우(예: 인증서 발급)에서는 `navigate(-1)`을 뒤로가기 기본 동작으로 사용하지 않는다.
- 각 스텝 페이지는 `MobileLayout`의 `backPath`를 명시하고, 현재 스텝 기준 이전 스텝 경로로 이동해야 한다.
- 히스토리 기반 이동이 필요한 예외 케이스는 `onBack`을 사용하되, 예외 사유를 PR 설명에 반드시 남긴다.
- 템플릿 기반 페이지(`Failed` 등)도 스텝형 플로우에 포함될 경우 `backPath`를 받아 동일 정책을 따른다.
