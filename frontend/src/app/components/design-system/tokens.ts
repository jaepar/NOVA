// Design Tokens for Mobile App

/**
 * Spacing System
 * 표준화된 스페이싱 값들입니다.
 */
export const spacing = {
  xs: '4px', // Tailwind: 1 (gap-1, p-1)
  sm: '8px', // Tailwind: 2 (gap-2, p-2)
  md: '16px', // Tailwind: 4 (gap-4, p-4)
  lg: '24px', // Tailwind: 6 (gap-6, p-6)
  xl: '32px', // Tailwind: 8 (gap-8, p-8)
} as const

/**
 * Layout Spacing Standards
 * 페이지 레이아웃에 사용되는 표준 스페이싱입니다.
 */
export const layout = {
  // 페이지 컨텐츠 영역
  contentPaddingTop: '', // 상단 여백 없음 (헤더에 바로 맞물림)
  contentPaddingBottom: 'pb-8', // 32px - 페이지 하단 여백
  contentPaddingX: 'px-5', // 20px - 페이지 좌우 여백 (FixedHeader와 동일)

  // 섹션 간격
  sectionGap: 'space-y-6', // 24px - 주요 섹션 간 간격
  subsectionGap: 'space-y-4', // 16px - 하위 섹션 간 간격
  itemGap: 'space-y-2', // 8px - 작은 아이템 간 간격
  tightGap: 'space-y-3', // 12px - 중간 아이템 간 간격

  // 컴포넌트 패딩
  cardPadding: 'p-4', // 16px - 카드 내부 패딩
  buttonPadding: 'px-4 py-2', // 가로 16px, 세로 8px - 버튼 패딩

  // Gap
  flexGap: 'gap-4', // 16px - flex/grid 기본 gap
  smallGap: 'gap-2', // 8px - 작은 gap
  largeGap: 'gap-6', // 24px - 큰 gap
} as const

/**
 * Fixed Header
 * 상단 고정 헤더의 표준 규격입니다.
 */
export const header = {
  // 위치
  top: 'top-0', // 상단 고정
  paddingTop: 'pt-5', // 20px - 상단 패딩
  height: 'h-14', // 56px - 내부 콘텐츠 높이

  // 콘텐츠 간격 (헤더 아래 콘텐츠의 padding-top)
  contentOffset: 'pt-19', // 76px - paddingTop(20px) + height(56px)

  // 구조
  gridColumns: '10% 80% 10%', // 뒤로가기 / 타이틀 / 우측 컨텐츠
  padding: 'px-5', // 20px - 좌우 패딩
} as const

/**
 * Bottom Sheet Template
 * 모든 바텀시트가 따르는 표준 템플릿 규격입니다.
 */
export const bottomSheet = {
  // 구조
  height: '520px', // 표준 고정 높이
  maxHeight: '80vh', // 최대 높이
  borderRadius: 'rounded-t-3xl', // 24px - 상단 모서리 라운딩

  // 헤더
  headerPadding: 'px-5 py-3', // 20px, 12px - 헤더 패딩

  // 콘텐츠
  contentPadding: 'px-5 py-6', // 20px, 24px - 콘텐츠 패딩
  contentSpacing: 'space-y-6', // 24px - 필터 시트 기준 콘텐츠 간격
  contentSpacingCompact: 'space-y-4', // 16px - 핀 입력 시트 기준 콘텐츠 간격

  // 하단 고정 버튼
  bottomActionPadding: 'px-5 pb-5', // 20px, 20px - 하단 버튼 영역 패딩
  bottomActionInner: 'p-4', // 16px - 하단 버튼 내부 패딩
  bottomActionBorder: 'rounded-2xl border border-border/50', // 하단 버튼 스타일

  // Handle Bar
  handleTop: 'pt-3', // 12px - 핸들바 상단 여백
  handleBottom: 'pb-2', // 8px - 핸들바 하단 여백

  // 닫기 버튼
  closeButtonSize: 'w-5 h-5', // 20px - X 아이콘 크기
  closeButtonPadding: 'p-2', // 8px - 닫기 버튼 패딩
} as const

/**
 * Scrollbar
 * 스크롤바 표시 관련 규격입니다.
 */
export const scrollbar = {
  // 전역 스크롤바는 숨김 처리됨
  display: 'none', // 스크롤바 표시 안 함
  behavior: 'smooth scrolling only', // 스크롤은 정상 작동 (마우스 휠, 터치)
  utilityClass: 'scrollbar-hide', // 선택적 적용 시 사용할 클래스
} as const

/**
 * Typography
 * 타이포그라피 크기입니다. theme.css의 변수와 연동됩니다.
 */
export const typography = {
  '2xl': '24px', // h1
  xl: '20px', // h2
  lg: '18px', // h3
  base: '16px', // h4, button, label, body
  sm: '14px', // small text
  xs: '12px', // extra small text
} as const

export const colors = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },
  border: '#E5E7EB',
} as const

export const fonts = {
  family: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    secondary: 'Urbanist, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
} as const
