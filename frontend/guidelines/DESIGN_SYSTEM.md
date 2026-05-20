# 디자인 시스템 가이드

## 1) 범위
이 문서는 NOVA 프론트엔드의 공통 UI 규칙을 정의한다.

상위 참조:
- `frontend/AGENTS.md`
- `frontend/guidelines/LAYOUT_GUIDELINES.md`

## 2) 핵심 토큰
- 기준 프레임: `390 x 844`
- 좌우 기본 패딩: `px-5` (20px)
- Primary: `#6366F1`
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

## 6) 공통 레이아웃 컴포넌트
- `FixedHeader`
- `MobileLayout`
- `FloatingBottom`
- `BottomNav`
- `BottomSheet`

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
