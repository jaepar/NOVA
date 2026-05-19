# Mobile App Design System

## Overview
iPhone 13 (390 x 844) 해상도의 모바일 앱 웹뷰 UI 디자인 시스템

## Design Tokens

### Spacing
8px 그리드 시스템:
- `xs`: 4px (Tailwind: 1)
- `sm`: 8px (Tailwind: 2)
- `md`: 16px (Tailwind: 4)
- `lg`: 24px (Tailwind: 6)
- `xl`: 32px (Tailwind: 8)

#### Layout Spacing Standards
페이지 레이아웃에 사용되는 표준 스페이싱:

**페이지 컨텐츠 영역:**
- 상단 여백: 없음 (헤더에 바로 맞물림)
- 하단 여백: `pb-8` (32px)
- 좌우 여백: `px-5` (20px)

**섹션 간격:**
- 주요 섹션: `space-y-6` (24px)
- 하위 섹션: `space-y-4` (16px)
- 중간 아이템: `space-y-3` (12px)
- 작은 아이템: `space-y-2` (8px)

**컴포넌트:**
- 카드 패딩: `p-4` (16px)
- 버튼 패딩: `px-4 py-2`

**Gap (Flex/Grid):**
- 기본: `gap-4` (16px)
- 작은: `gap-2` (8px)
- 큰: `gap-6` (24px)

### Typography
**Font Family:**
- Primary Font: Inter
- Secondary Font: Urbanist

**Font Sizes (CSS Variables in theme.css):**
- `--text-2xl`: 24px (h1)
- `--text-xl`: 20px (h2)
- `--text-lg`: 18px (h3)
- `--text-base`: 16px (h4, button, label, body)
- `--text-sm`: 14px (작은 텍스트)
- `--text-xs`: 12px (매우 작은 텍스트)

**Font Weight:**
- Medium: 500 (제목, 버튼, 레이블)
- Normal: 400 (본문 텍스트)

**Line Height:**
- 모든 텍스트: 1.5

### Scrollbar
**모든 스크롤 영역에서 스크롤바를 숨겨 깔끔한 모바일 UI를 유지합니다.**

**규격:**
- 표시: `none` (전역 적용)
- 동작: 스크롤 기능은 정상 작동 (마우스 휠, 터치 드래그)
- 유틸리티 클래스: `.scrollbar-hide` (선택적 적용 가능)

**구현:**
```css
/* theme.css에 전역 설정 */
*::-webkit-scrollbar {
  display: none;
}
* {
  -ms-overflow-style: none; /* IE, Edge */
  scrollbar-width: none; /* Firefox */
}
```

**특징:**
- 모든 브라우저에서 스크롤바 완전히 숨김 (Chrome, Firefox, Safari, Edge)
- 스크롤바가 레이아웃을 밀어내지 않음
- 스크롤 기능은 정상 작동
- 추가 클래스 적용 불필요 (전역 자동 적용)

### Colors
- Primary: #6366F1 (Indigo)
- Text: #1F2937 (Gray-800)
- Secondary Text: #6B7280 (Gray-500)
- Background: #FFFFFF
- Secondary Background: #F3F4F6
- Border: #E5E7EB

## Components

### Input Components

#### CommonInputGroup
레이블과 입력 필드가 결합된 범용 컴포넌트
```tsx
import { CommonInputGroup } from './components/design-system/CommonInputGroup';

<CommonInputGroup
  label="Full Name"
  placeholder="Enter your name"
  value={value}
  onChange={setValue}
  type="text"
/>
```

### Button Components

**🔴 중요 규칙**: 
- **모든 버튼은 디자인 시스템 컴포넌트(Btn_1Col, Btn_2Col)를 사용해야 합니다**
- 커스텀 `<button>` 태그 사용 금지 - 일관성과 유지보수를 위해 반드시 디자인 시스템 컴포넌트 사용
- 예외: UI 라이브러리 컴포넌트 내부의 버튼(Radix UI 등)

**호버 효과 규칙**: 모든 버튼은 호버 시 순수한 색상 변경을 사용하며, 투명도 변경(`hover:opacity-*` 또는 `/90` 같은 투명도 표기)을 사용하지 않습니다.
- Primary: `hover:bg-blue-700` (더 어두운 파란색)
- Secondary: `hover:bg-accent` (다른 배경색)
- Outline: `hover:bg-blue-50` 또는 `hover:bg-secondary` (연한 배경)

#### Btn_1Col
가로 100% 단일 버튼 컴포넌트
```tsx
import { Btn_1Col } from './components/design-system/Btn_1Col';

<Btn_1Col variant="primary" onClick={handleClick}>
  Button Text
</Btn_1Col>
```

**Variants:**
- `primary`: 배경색 primary, 2px primary 테두리, 호버 시 `bg-blue-700`
- `secondary`: 배경색 secondary, 2px secondary 테두리, 호버 시 `bg-accent`
- `outline`: 배경색 transparent, 2px primary 테두리, 호버 시 `bg-blue-50`

**스타일:**
- 패딩: `py-4 px-6` (세로 16px, 가로 24px)
- 모서리: `rounded-xl` (12px)
- 테두리: 모든 variant에 `border-2` 적용 (높이 통일)
- 너비: `w-full` (100%)
- 호버: 색상 변경 (투명도 변경 금지)

#### Btn_2Col
50:50 분할 2열 버튼 컴포넌트 (간격 16px)
```tsx
import { Btn_2Col } from './components/design-system/Btn_2Col';

<Btn_2Col
  leftLabel="Cancel"
  rightLabel="Confirm"
  onLeftClick={handleCancel}
  onRightClick={handleConfirm}
  leftVariant="outline"
  rightVariant="primary"
/>
```

**Variants:** Btn_1Col과 동일
- `primary`: 배경색 primary, 2px primary 테두리, 호버 시 `bg-blue-700`
- `secondary`: 배경색 secondary, 2px secondary 테두리, 호버 시 `bg-accent`
- `outline`: 배경색 transparent, 2px border 테두리, 호버 시 `bg-secondary`

**스타일:**
- 패딩: `py-4 px-6` (세로 16px, 가로 24px)
- 간격: `gap-4` (16px)
- 모서리: `rounded-xl` (12px)
- 테두리: 모든 variant에 `border-2` 적용 (높이 통일)
- 너비: 각 버튼 `flex-1` (50:50 분할)
- 호버: 색상 변경 (투명도 변경 금지)

### Layout Components

#### FixedHeader
상단 고정 헤더 (3열 그리드 구조)
- 위치: Fixed
- **높이**: `h-14` (56px) - 이 값은 절대 변경하지 말 것
- 컨텐츠는 헤더 뒤로 스크롤됨
- 하단 보더 제거됨
- **3열 비율 분배**: 왼쪽(뒤로가기 10%) | 중앙(타이틀 80%) | 오른쪽(확장용 10%)

**🔴 중요 규칙**:
- FixedHeader 높이(`h-14`) = 콘텐츠 패딩(`pt-14`) = 56px
- 이 규칙을 통해 헤더와 콘텐츠가 겹치지 않고 정확히 맞닿음
- MobileLayout은 자동으로 이 규칙 적용

```tsx
import { FixedHeader } from './components/layout/FixedHeader';

<FixedHeader 
  title="Page Title"
  showBackButton={true}
  onBack={() => navigate(-1)}
  rightContent={<button>우측 버튼</button>} // 선택사항
/>
```

**레이아웃:**
- `gridTemplateColumns: '10% 80% 10%'` - 10:80:10 비율
- 각 영역: `flex items-center justify-center`
- 모든 요소가 각 열의 중앙에 배치

#### FloatingBottom
**중요: 화면 하단의 모든 버튼은 반드시 FloatingBottom으로 감싸야 합니다**

화면 하단 고정 버튼 영역 컨테이너
- **위치**: `fixed bottom-0 left-0 right-0` (화면 바닥에 붙음)
- **제약**: `max-w-[390px] mx-auto` (중앙 정렬, 최대 너비)
- **배경**: `bg-background` (흰색 배경으로 스크롤 콘텐츠 가림)
- **패딩**: 
  - `px-[20px]`: 좌우 20px
  - `pt-[5px]`: 상단 5px
  - `pb-[20px]`: 하단 20px
- **z-index**: `z-40`

```tsx
import { FloatingBottom } from './components/layout/FloatingBottom';
import { Btn_1Col } from './components/design-system/Btn_1Col';

<FloatingBottom>
  <Btn_1Col onClick={handleClick}>
    Continue
  </Btn_1Col>
</FloatingBottom>
```

**특징**: 
- 상단 FixedHeader처럼 배경색이 있어 스크롤 시 뒤의 콘텐츠를 가림
- 버튼의 시각적 스타일(색상, 테두리, 라운딩)은 Btn_1Col, Btn_2Col이 담당
- FloatingBottom은 위치 고정과 배경 처리를 담당

#### MobileLayout
FixedHeader + FloatingBottom을 결합한 전체 레이아웃 래퍼

```tsx
import { MobileLayout } from './components/layout/MobileLayout';

<MobileLayout
  title="Page Title"
  bottomContent={<Btn_1Col>Button</Btn_1Col>}
>
  {/* Page content */}
</MobileLayout>
```

#### BottomSheet
하단에서 올라오는 모달 시트 컴포넌트

```tsx
import { BottomSheet } from './components/layout/BottomSheet';

const [isOpen, setIsOpen] = useState(false);

<BottomSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="필터"
>
  {/* Sheet content */}
</BottomSheet>
```

**특징:**
- 하단에서 올라오는 애니메이션
- 배경 딤(Dim) 처리
- 상단 핸들 바
- 스크롤 가능한 컨텐츠
- 최대 높이: 80vh
- 모바일 중심 UX

## Layout Rules

### Bottom Button Positioning
✅ **DO**: 하단 버튼은 항상 FloatingBottom으로 감싸기
```tsx
<FloatingBottom>
  <Btn_1Col>시작하기</Btn_1Col>
</FloatingBottom>
```

**FloatingBottom의 역할**:
- 화면 바닥에 고정 (`fixed bottom-0`)
- 배경색 제공 (`bg-background`) - 스크롤 시 뒤 콘텐츠를 가림
- 표준 패딩 제공 (`px-[20px] pt-[5px] pb-[20px]`)
- 버튼의 시각적 스타일(색상, 테두리, 라운딩)은 내부 버튼 컴포넌트가 담당

❌ **DON'T**: 커스텀 div로 하단 버튼 배치 금지
```tsx
{/* 이렇게 하지 마세요 */}
<div className="fixed bottom-0">
  <Btn_1Col>시작하기</Btn_1Col>
</div>
```

❌ **DON'T**: 커스텀 button 태그 사용 금지
```tsx
{/* 이렇게 하지 마세요 */}
<button className="bg-primary hover:bg-blue-700">버튼</button>

{/* 대신 디자인 시스템 컴포넌트 사용 */}
<Btn_1Col variant="primary">버튼</Btn_1Col>
```

❌ **DON'T**: 버튼 호버에 투명도 변경 사용 금지
```tsx
{/* 이렇게 하지 마세요 */}
<button className="hover:opacity-90">버튼</button>
<button className="hover:bg-primary/90">버튼</button> {/* /90도 투명도 표기 */}
```

### Header Positioning
- 모든 페이지는 FixedHeader 또는 MobileLayout 사용
- 컨텐츠는 `pt-14` (헤더 높이만큼 padding-top) 적용
- 스크롤 시 컨텐츠가 헤더 뒤로 넘어가도록 구현

## Routing Structure

```
/ - Home (데모 페이지)
/landing - 랜딩 페이지
/step-1 - 개인정보 입력
/step-2 - 경험 레벨 선택
/step-3 - 완료 화면
/design-system - 디자인 시스템 문서
```

## Design Tokens 파일

모든 디자인 토큰은 `src/app/components/design-system/tokens.ts`에 정의되어 있습니다:

```tsx
import { spacing, typography, layout, colors, fonts, scrollbar } from './components/design-system/tokens';

// 사용 예시
style={{ height: spacing.md }}  // 16px
className={layout.sectionGap}   // space-y-6
scrollbar.display                // 'none'
```

## File Structure

```
src/
├── app/
│   ├── components/
│   │   ├── design-system/
│   │   │   ├── tokens.ts          # 디자인 토큰 정의
│   │   │   ├── CommonInputGroup.tsx
│   │   │   ├── Btn_1Col.tsx
│   │   │   └── Btn_2Col.tsx
│   │   └── layout/
│   │       ├── FixedHeader.tsx
│   │       ├── FloatingBottom.tsx
│   │       └── MobileLayout.tsx
│   ├── pages/
│   │   └── DesignSystem.tsx      # 디자인 시스템 문서 페이지
│   └── routes.ts
└── styles/
    ├── fonts.css
    └── theme.css                  # CSS 변수 정의 (타이포그라피 등)
```
