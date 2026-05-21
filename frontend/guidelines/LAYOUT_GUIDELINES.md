# 레이아웃 가이드

## 1) 프레임 정책 (필수)
- 기준 프레임: `390 x 844`
- 프레임 기준 요소: `#root`
- 뷰포트가 기준보다 작으면 비율 유지 축소
- 뷰포트가 기준보다 커도 `390x844` 고정 (확대 금지)
- 프레임 외부 영역은 별도 배경색으로 앱 영역과 구분

## 2) 현재 구현 기준
- `src/main.tsx`
  - 로드/리사이즈 시 `--app-scale` 계산
  - `scale = min(windowWidth/390, windowHeight/844, 1)`
- `src/styles/theme.css`
  - `#root` 고정 크기:
    - `--app-width: 390px`
    - `--app-height: 844px`
  - `#root`에 `transform: scale(var(--app-scale))` 적용
  - `body`에서 중앙 정렬 및 외부 배경 영역 처리

## 3) 레이아웃 구성 규칙
- 모든 페이지는 `MobileLayout`을 사용한다.
- 상단 영역은 `MobileLayout`의 `headerType` 규칙으로 사용한다.
  - `headerType="back"`: 뒤로가기 헤더 (`FixedHeader`)
  - `headerType="close"`: 닫기 헤더 (`CloseFixedHeader`)
  - `headerType="none"`: 버튼 없는 타이틀 헤더 (`TitleOnlyFixedHeader`)
- 하단 고정 액션은 `FloatingBottom` 또는 `BottomNav`를 사용한다.
- `MobileLayout`의 `bottomContent`를 사용하면 `FloatingBottom` 규격이 적용된다.
- 하단 고정 영역 배경색은 `bottomBackgroundColor`로 제어하며 기본값은 `#ffffff`이다.
- 헤더/콘텐츠 오프셋은 CSS 변수로 단일 관리한다.
  - `--app-header-top-padding: 20px`
  - `--app-header-height: 56px`
  - `--app-content-offset: 76px` (계산값)
- 초기 렌더 시 본문 시작 지점은 `--app-content-offset`를 사용한다.
- 긴 페이지에서 본문이 헤더 뒤로 스크롤되는 동작은 정상이다.
- 페이지별 프레임 제한(`max-w-[390px] mx-auto`) 중복 선언 금지

## 4) 간격 규칙
- 좌우 기본 패딩: `px-5` (20px)
- 헤더/본문/하단 간격은 공통 레이아웃 컴포넌트 기준으로 유지
- 특별한 사유 없이 페이지별 간격 예외를 만들지 않는다

## 5) 반응형 점검 체크리스트
- [ ] `390x844`에서 1:1 렌더링
- [ ] 기준 이하에서 비율 유지 축소
- [ ] 기준 이상에서 `390x844` 고정
- [ ] 프레임 외부 배경 구분 확인
- [ ] 헤더/하단 고정 영역 정렬 이상 없음

## 6) 동기화 정책
프레임/레이아웃 정책 변경 시 아래를 함께 갱신한다.
- `frontend/AGENTS.md`
- `frontend/guidelines/DESIGN_SYSTEM.md`
- `frontend/guidelines/LAYOUT_GUIDELINES.md`
- `frontend/src/main.tsx`
- `frontend/src/styles/theme.css`
