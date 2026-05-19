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

## 3) 프레임 규격 (필수)
- 기준 프레임: `390 x 844`
- 프레임 기준 요소: `#root`
- 화면이 작아지면 비율 유지 축소
- 화면이 커져도 `390x844` 이상 확장 금지
- 프레임 외부 영역은 별도 배경으로 구분 유지

## 4) 레이아웃 규칙 (필수)
- 모든 페이지는 `MobileLayout`을 기본 스캐폴드로 사용
- 상단 네비게이션은 `FixedHeader` 사용
- 하단 고정 액션은 `FloatingBottom` 또는 `BottomNav` 사용
- 초기 렌더 시 본문은 헤더 아래에서 시작해야 함
- 페이지 간 본문 시작 오프셋은 동일해야 함
- 스크롤 중 본문이 고정 헤더 뒤로 지나가는 동작은 정상 동작으로 간주
- 페이지별 `max-w-[390px] mx-auto` 중복 선언 금지

## 5) 컴포넌트 규칙
- 상호작용 버튼은 공통 버튼 컴포넌트 사용 (`AppButton`, `Btn_1Col`, `Btn_2Col`)
- 입력 블록은 `CommonInputGroup` 등 공통 입력 컴포넌트 우선
- 임시/일회성 스타일 남발 금지

## 6) 검증 체크리스트
- [ ] `390x844` 프레임 규칙 유지
- [ ] 작은 화면에서 비율 유지 축소 동작 확인
- [ ] 헤더/본문/하단 고정 영역 겹침 없음
- [ ] 공통 레이아웃 컴포넌트 일관 사용
- [ ] 페이지별 프레임 중복 규칙 없음

## 7) 파일 책임 범위
- 프레임/스케일: `src/main.tsx`, `src/styles/theme.css`
- 공통 레이아웃: `src/app/components/layout/*`
- 페이지 구현: `src/app/pages/*`
- 디자인 시스템: `src/app/components/design-system/*`

## 8) 동기화 정책
레이아웃/디자인 규칙 변경 시 아래 문서를 함께 갱신한다.
- `frontend/AGENTS.md`
- `frontend/guidelines/DESIGN_SYSTEM.md`
- `frontend/guidelines/LAYOUT_GUIDELINES.md`
