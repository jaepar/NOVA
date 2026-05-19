# Layout Guidelines

## iPhone 13 규격 (390 x 844) + 반응형

모든 페이지는 iPhone 13 규격을 기준으로 하되, 작은 화면에 대응하는 반응형 디자인을 적용합니다:
- **너비**: 최대 390px (작은 화면에서는 100% 사용)
- **높이**: 최대 844px 또는 100vh
- **스크롤**: 각 페이지 내부에서만 발생
- **오토레이아웃**: 모든 컴포넌트는 부모 너비에 맞춰 조정됨

## 일관성 규칙

모든 페이지는 다음 레이아웃 규칙을 따라야 합니다:

### 🔴 중요: 상단 고정 헤더 규칙
**FixedHeader 높이 = 콘텐츠 상단 패딩 = 56px**
- FixedHeader: `h-14` (56px)
- MobileLayout main: `pt-14` (56px)
- 커스텀 헤더 사용 시에도 동일 규칙 적용 (예: Main 페이지)
- **결과**: 헤더 하단과 콘텐츠 상단이 정확히 맞닿아 겹침 없음

### 🔴 중요: 스크롤바 숨김 규칙
**모든 스크롤 영역에서 스크롤바가 자동으로 숨겨집니다**
- 전역 설정: `theme.css`에 적용
- 모든 브라우저 지원: Chrome, Firefox, Safari, Edge
- 스크롤 기능은 정상 작동 (마우스 휠, 터치 드래그)
- 레이아웃이 스크롤바로 인해 밀리지 않음
- **별도 클래스 적용 불필요** (자동 적용)

### 1. 뷰포트 크기 (반응형)
- **body**: `width: 100%; max-width: 390px; height: 100vh; max-height: 844px;`
- **#root**: `width: 100%; height: 100%;` (스크롤 컨테이너)
- **각 페이지 래퍼**: `h-full w-full` (부모 크기를 따름)

### 2. 최대 너비 (Max Width) - 반응형 패턴
- **모든 컨테이너**: `w-full max-w-[390px] mx-auto`
- 작은 화면: 100% 너비 사용
- 큰 화면: 최대 390px로 제한
- 항상 중앙 정렬 (`mx-auto`)

### 3. 스페이싱 표준

#### 좌우 패딩 (Horizontal Padding)
- **모든 영역**: `px-5` (20px)
- FixedHeader, 메인 컨텐츠, FloatingBottom, BottomNav 모두 동일

#### 페이지 컨텐츠 여백
- **상단**: 없음 (헤더에 바로 맞물림)
- **하단**: `pb-8` (32px)

#### 섹션 간격
- **주요 섹션**: `space-y-6` (24px)
- **하위 섹션**: `space-y-4` (16px)
- **중간 아이템**: `space-y-3` (12px)
- **작은 아이템**: `space-y-2` (8px)

#### 컴포넌트 스페이싱
- **카드 패딩**: `p-4` (16px)
- **기본 Gap**: `gap-4` (16px)
- **작은 Gap**: `gap-2` (8px)
- **큰 Gap**: `gap-6` (24px)

### 4. 하단 영역 (Bottom Area) - 반응형

#### FloatingBottom (단일 버튼용)
```tsx
<FloatingBottom>
  <Btn_1Col>버튼</Btn_1Col>
</FloatingBottom>
```

**구조 (반응형):**
- 외부: `fixed bottom-5 left-0 right-0 w-full max-w-[390px] mx-auto px-5`
- 내부: `bg-background/80 backdrop-blur-[20px] p-4 rounded-2xl w-full`
- 버튼: `w-full` (부모 너비를 따름)

#### BottomNav (네비게이션 탭용)
```tsx
<BottomNav />
```

**구조 (반응형):**
- 외부: `fixed bottom-5 left-0 right-0 w-full max-w-[390px] mx-auto px-5`
- 내부: `bg-background/95 backdrop-blur-[20px] px-2 py-3 rounded-2xl w-full`
- 탭들: Flexbox로 공간 균등 배분

### 5. 페이지 구조

#### 표준 페이지 (MobileLayout 사용)
```tsx
<MobileLayout
  title="페이지 제목"
  bottomContent={<Btn_1Col>버튼</Btn_1Col>}
  headerRightContent={<button>우측 버튼</button>} // 선택사항
>
  {/* 컨텐츠 */}
</MobileLayout>
```

**FixedHeader 구조 (3열 그리드 - 10:80:10 비율):**
- 1열 (10%): 뒤로가기 버튼 (중앙 정렬)
- 2열 (80%): 타이틀 (중앙 정렬)
- 3열 (10%): 우측 컨텐츠 (중앙 정렬, 확장 가능)

**자동 적용 (반응형):**
- 전체 높이와 너비: `h-full w-full`
- Flexbox 레이아웃: `flex flex-col`
- FixedHeader: `w-full max-w-[390px]` (pt-14)
- 스크롤 가능한 컨텐츠 영역: `flex-1 w-full max-w-[390px] overflow-y-auto px-5`
- FloatingBottom: `w-full max-w-[390px]` (pb-32)

#### 커스텀 헤더가 필요한 페이지 (Main 페이지)
```tsx
<div className="h-full w-full bg-background max-w-[390px] mx-auto pb-32 overflow-y-auto">
  <header className="px-5 py-4">{/* 커스텀 헤더 */}</header>
  <main className="px-5">{/* 컨텐츠 */}</main>
  <BottomNav />
</div>
```

**주의사항 (반응형):**
- 외부 wrapper: `h-full w-full max-w-[390px] mx-auto pb-32 overflow-y-auto`
- 모든 내부 영역: `px-5` 일관성 유지
- 높이: `h-full` (최대 844px 또는 100vh)
- 너비: `w-full` (최대 390px, 작은 화면에서는 100%)

## 체크리스트

새 페이지 생성 시 확인사항:

- [ ] 페이지 래퍼에 `h-full w-full` 적용 (반응형)
- [ ] 스크롤 영역에 `overflow-y-auto` 적용
- [ ] 최대 너비 패턴: `w-full max-w-[390px] mx-auto`
- [ ] 모든 컨테이너에 `w-full` 기본 적용
- [ ] 좌우 패딩 `px-5` 일관성
- [ ] 하단 여백 `pb-32` (FloatingBottom/BottomNav 공간)
- [ ] 하단 버튼은 FloatingBottom 또는 BottomNav 사용
- [ ] MobileLayout 사용 (또는 명확한 이유로 예외 처리)
- [ ] 스크롤바 숨김 (자동 적용 - 별도 작업 불필요)
- [ ] 390px (기준), 작은 화면, 큰 화면에서 모두 테스트

## 현재 페이지 상태

✅ **MobileLayout 사용 (반응형 적용):**
- Language
- Landing
- Step1, Step2, Step3
- Product
- DesignSystem
- Transfer, Exchange, MyPage
- Home (데모/네비게이션)

⚠️ **커스텀 레이아웃 (반응형 적용):**
- Main (커스텀 헤더 + BottomNav)

**모든 페이지 공통:**
- ✅ `w-full max-w-[390px]` 패턴 적용
- ✅ 작은 화면(~390px)에서 100% 너비 사용
- ✅ 큰 화면에서 최대 390px로 제한
- ✅ 하단 버튼 영역 일관성 유지
