import { useState } from 'react';
import { MobileLayout } from '../components/layout/MobileLayout';
import { BottomSheet } from '../components/layout/BottomSheet';
import { CommonInputGroup } from '../components/design-system/CommonInputGroup';
import { Btn_1Col } from '../components/design-system/Btn_1Col';
import { Btn_2Col } from '../components/design-system/Btn_2Col';
import { FilterBottomSheet } from '../components/design-system/FilterBottomSheet';
import { PinInputBottomSheet } from '../components/design-system/PinInputBottomSheet';
import { Spinner } from '../components/design-system/Spinner';
import { TimeBasedSky } from '../components/design-system/TimeBasedSky';
import { spacing, colors, typography, layout, header, bottomSheet, scrollbar } from '../components/design-system/tokens';

export function DesignSystem() {
  const [inputValue, setInputValue] = useState('');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isPinSheetOpen, setIsPinSheetOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('전체');
  const [selectedType, setSelectedType] = useState('전체');

  return (
    <>
    <MobileLayout title="Design System" showBackButton={false}>
      <div className="space-y-8 pb-8">
        {/* Typography */}
        <section className="space-y-4">
          <h2>Typography</h2>
          <div className="space-y-3 bg-secondary p-4 rounded-xl">
            <div>
              <h1>Heading 1</h1>
              <p className="text-xs text-muted-foreground mt-1">
                {typography['2xl']} (24px) - h1
              </p>
            </div>
            <div>
              <h2>Heading 2</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {typography.xl} (20px) - h2
              </p>
            </div>
            <div>
              <h3>Heading 3</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {typography.lg} (18px) - h3
              </p>
            </div>
            <div>
              <h4>Heading 4</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {typography.base} (16px) - h4, button, label
              </p>
            </div>
            <div>
              <p className="text-sm">Small text</p>
              <p className="text-xs text-muted-foreground mt-1">
                {typography.sm} (14px) - text-sm
              </p>
            </div>
            <div>
              <p className="text-xs">Extra small text</p>
              <p className="text-xs text-muted-foreground mt-1">
                {typography.xs} (12px) - text-xs
              </p>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section className="space-y-4">
          <h2>Spacing System</h2>
          <div className="space-y-2 bg-secondary p-4 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-1 bg-primary" style={{ height: spacing.xs }}>
                <span className="sr-only">4px</span>
              </div>
              <span className="text-sm">xs: 4px (Tailwind: 1)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 bg-primary" style={{ height: spacing.sm }}>
                <span className="sr-only">8px</span>
              </div>
              <span className="text-sm">sm: 8px (Tailwind: 2)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 bg-primary" style={{ height: spacing.md }}>
                <span className="sr-only">16px</span>
              </div>
              <span className="text-sm">md: 16px (Tailwind: 4)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-6 bg-primary" style={{ height: spacing.lg }}>
                <span className="sr-only">24px</span>
              </div>
              <span className="text-sm">lg: 24px (Tailwind: 6)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 bg-primary" style={{ height: spacing.xl }}>
                <span className="sr-only">32px</span>
              </div>
              <span className="text-sm">xl: 32px (Tailwind: 8)</span>
            </div>
          </div>
        </section>

        {/* Layout Spacing Standards */}
        <section className="space-y-4">
          <h2>Layout Standards</h2>
          <p className="text-sm text-muted-foreground">
            페이지 레이아웃에 사용하는 표준 스페이싱 규칙입니다.
          </p>
          <div className="space-y-3">
            <div className="bg-secondary p-4 rounded-xl space-y-2">
              <h4>페이지 컨텐츠 영역</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• 상단 여백: 없음 (헤더에 바로 맞물림)</p>
                <p>• 하단 여백: {layout.contentPaddingBottom} (32px)</p>
                <p>• 좌우 여백: {layout.contentPaddingX} (20px)</p>
              </div>
            </div>

            <div className="bg-secondary p-4 rounded-xl space-y-2">
              <h4>섹션 간격</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• 주요 섹션: {layout.sectionGap} (24px)</p>
                <p>• 하위 섹션: {layout.subsectionGap} (16px)</p>
                <p>• 중간 아이템: {layout.tightGap} (12px)</p>
                <p>• 작은 아이템: {layout.itemGap} (8px)</p>
              </div>
            </div>

            <div className="bg-secondary p-4 rounded-xl space-y-2">
              <h4>컴포넌트 패딩</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• 카드: {layout.cardPadding} (16px)</p>
                <p>• 버튼: {layout.buttonPadding}</p>
              </div>
            </div>

            <div className="bg-secondary p-4 rounded-xl space-y-2">
              <h4>Gap (Flex/Grid)</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• 기본: {layout.flexGap} (16px)</p>
                <p>• 작은: {layout.smallGap} (8px)</p>
                <p>• 큰: {layout.largeGap} (24px)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Colors */}
        <section className="space-y-4">
          <h2>Color Palette</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="w-full h-16 bg-primary rounded-lg"></div>
              <p className="text-sm">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-secondary rounded-lg border border-border"></div>
              <p className="text-sm">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-accent rounded-lg border border-border"></div>
              <p className="text-sm">Accent</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-destructive rounded-lg"></div>
              <p className="text-sm">Destructive</p>
            </div>
          </div>
        </section>

        {/* Scrollbar */}
        <section className="space-y-4">
          <h2>Scrollbar</h2>
          <p className="text-sm text-muted-foreground">
            모든 스크롤 영역에서 스크롤바를 숨겨 깔끔한 모바일 UI를 유지합니다.
          </p>
          <div className="space-y-2 bg-secondary p-4 rounded-xl">
            <h4>스크롤바 규격</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• 표시: {scrollbar.display} (전역 적용)</p>
              <p>• 동작: {scrollbar.behavior}</p>
              <p>• 유틸리티 클래스: .{scrollbar.utilityClass}</p>
            </div>
          </div>
          <div className="bg-primary/10 border-2 border-primary p-4 rounded-xl">
            <h4 className="mb-2 text-primary">스크롤바 숨김 규칙 ⭐</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• 모든 스크롤 가능 영역에서 스크롤바가 자동으로 숨겨집니다</p>
              <p>• 스크롤 기능은 정상 작동 (마우스 휠, 터치 드래그)</p>
              <p>• 레이아웃이 스크롤바로 인해 밀리지 않습니다</p>
              <p>• theme.css에 전역 설정되어 있어 별도 클래스 불필요</p>
            </div>
          </div>
        </section>

        {/* CommonInputGroup */}
        <section className="space-y-4">
          <h2>CommonInputGroup</h2>
          <p className="text-sm text-muted-foreground">
            Combined label and input field component
          </p>
          <div className="space-y-4">
            <CommonInputGroup
              label="Full Name"
              placeholder="Enter your name"
              value={inputValue}
              onChange={setInputValue}
            />
            <CommonInputGroup
              label="Email Address"
              type="email"
              placeholder="your@email.com"
            />
            <CommonInputGroup
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </section>

        {/* Btn_1Col */}
        <section className="space-y-4">
          <h2>Btn_1Col</h2>
          <p className="text-sm text-muted-foreground">
            Single button spanning full width (100%). 모든 variant가 동일한 높이를 유지하도록 border-2가 적용됩니다.
          </p>
          <div className="space-y-2 bg-secondary p-4 rounded-xl mb-4">
            <h4>스타일 규격</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• 패딩: py-4 px-6 (16px, 24px)</p>
              <p>• 테두리: border-2 (모든 variant)</p>
              <p>• 모서리: rounded-xl (12px)</p>
              <p>• 너비: w-full (100%)</p>
            </div>
          </div>
          <div className="space-y-3">
            <Btn_1Col variant="primary">
              Primary Button
            </Btn_1Col>
            <Btn_1Col variant="secondary">
              Secondary Button
            </Btn_1Col>
            <Btn_1Col variant="outline">
              Outline Button
            </Btn_1Col>
            <Btn_1Col disabled>
              Disabled Button
            </Btn_1Col>
          </div>
        </section>

        {/* Btn_2Col */}
        <section className="space-y-4">
          <h2>Btn_2Col</h2>
          <p className="text-sm text-muted-foreground">
            Two buttons in 50:50 split with 16px gap. 모든 variant가 동일한 높이를 유지하도록 border-2가 적용됩니다.
          </p>
          <div className="space-y-2 bg-secondary p-4 rounded-xl mb-4">
            <h4>스타일 규격</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• 패딩: py-4 px-6 (16px, 24px)</p>
              <p>• 테두리: border-2 (모든 variant)</p>
              <p>• 간격: gap-4 (16px)</p>
              <p>• 모서리: rounded-xl (12px)</p>
              <p>• 비율: flex-1 (50:50)</p>
            </div>
          </div>
          <div className="space-y-3">
            <Btn_2Col
              leftLabel="Cancel"
              rightLabel="Confirm"
              leftVariant="outline"
              rightVariant="primary"
            />
            <Btn_2Col
              leftLabel="Back"
              rightLabel="Next"
              leftVariant="secondary"
              rightVariant="primary"
            />
          </div>
        </section>

        {/* Layout Components */}
        <section className="space-y-4">
          <h2>Layout Components</h2>
          <div className="space-y-3 text-sm">
            <div className="bg-secondary p-4 rounded-xl">
              <h4 className="mb-2">FixedHeader</h4>
              <p className="text-muted-foreground mb-2">
                Fixed position header with back button and title. Content scrolls behind it.
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• 위치: {header.top} (상단 고정)</p>
                <p>• 상단 패딩: {header.paddingTop} (20px)</p>
                <p>• 높이: {header.height} (56px, 내부 콘텐츠)</p>
                <p>• 구조: 뒤로가기(10%) / 타이틀(80%) / 우측 컨텐츠(10%)</p>
                <p>• 좌우 패딩: {header.padding} (20px)</p>
                <p>• 콘텐츠 offset: {header.contentOffset} (76px = 20px + 56px)</p>
              </div>
            </div>
            <div className="bg-primary/10 border-2 border-primary p-4 rounded-xl">
              <h4 className="mb-2 text-primary">FloatingBottom ⭐</h4>
              <p className="text-muted-foreground mb-2">
                화면 하단 고정 영역으로 스크롤되는 콘텐츠를 가립니다. Solid background로 깔끔한 UI를 유지합니다.
              </p>
              <div className="text-sm text-muted-foreground space-y-1 mb-2">
                <p>• 위치: fixed bottom-0 left-0 right-0 z-40</p>
                <p>• 배경: bg-background (solid, no blur)</p>
                <p>• 패딩: px-[20px] pt-[5px] pb-[20px]</p>
                <p>• 모서리: 라운딩 없음</p>
              </div>
              <p className="text-sm font-medium text-primary">
                ✓ 규칙: 화면 하단의 모든 버튼은 반드시 FloatingBottom으로 감싸야 합니다
              </p>
            </div>
            <div className="bg-secondary p-4 rounded-xl">
              <h4 className="mb-2">MobileLayout</h4>
              <p className="text-muted-foreground mb-2">
                Complete mobile layout wrapper combining FixedHeader and FloatingBottom with proper spacing.
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• 자동으로 FixedHeader {header.paddingTop} 패딩 적용</p>
                <p>• 메인 콘텐츠: {header.contentOffset} 자동 적용</p>
                <p>• 하단 여백: pb-32 (FloatingBottom 공간)</p>
              </div>
            </div>
            <div className="bg-primary/10 border-2 border-primary p-4 rounded-xl">
              <h4 className="mb-2 text-primary">BottomSheet Template ⭐</h4>
              <p className="text-muted-foreground mb-2">
                모든 바텀 시트는 일관된 템플릿을 따릅니다. Title과 닫기 버튼은 항상 표시됩니다.
              </p>
              <div className="text-sm text-muted-foreground space-y-1 mb-3">
                <p>• 표준 높이: {bottomSheet.height} (고정)</p>
                <p>• 최대 높이: {bottomSheet.maxHeight}</p>
                <p>• 모서리: {bottomSheet.borderRadius} (24px)</p>
                <p>• 헤더 패딩: {bottomSheet.headerPadding} (20px, 12px)</p>
                <p>• 콘텐츠 패딩: {bottomSheet.contentPadding} (20px, 24px)</p>
                <p>• 하단 버튼: FloatingBottom 스타일 (backdrop-blur, 하단 고정)</p>
                <p>• 닫기 버튼: {bottomSheet.closeButtonSize} (우측 상단 고정)</p>
                <p>• Handle Bar: 상단 중앙 표시</p>
                <p className="text-primary font-medium">✓ 규칙: 버튼이 있는 경우 bottomAction prop으로 하단 고정</p>
              </div>
              <Btn_1Col onClick={() => setIsBottomSheetOpen(true)}>
                Open Bottom Sheet Demo
              </Btn_1Col>
            </div>
          </div>
        </section>

        {/* Spinner */}
        <section className="space-y-4">
          <h2>Spinner</h2>
          <p className="text-sm text-muted-foreground">
            로딩 상태를 나타내는 애니메이션 스피너 컴포넌트입니다.
          </p>
          <div className="space-y-2 bg-secondary p-4 rounded-xl mb-4">
            <h4>스타일 규격</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• 크기: sm (32px), md (48px), lg (64px)</p>
              <p>• 색상: blue-600 (Primary)</p>
              <p>• 애니메이션: 회전 (animate-spin)</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-secondary p-6 rounded-xl">
              <div className="flex items-center justify-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-xs text-muted-foreground">Small</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="md" />
                  <span className="text-xs text-muted-foreground">Medium</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="lg" />
                  <span className="text-xs text-muted-foreground">Large</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TimeBasedSky */}
        

        {/* Bottom Sheet Variants */}
        <section className="space-y-4">
          <h2>Bottom Sheet Variants</h2>
          <p className="text-sm text-muted-foreground">
            서비스에서 사용하는 특화된 바텀 시트 컴포넌트들입니다.
          </p>
          <div className="space-y-3">
            <div className="bg-secondary p-4 rounded-xl">
              <h4 className="mb-2">FilterBottomSheet</h4>
              <p className="text-muted-foreground mb-3">
                필터링 옵션을 선택할 수 있는 바텀 시트입니다. 여러 섹션의 필터를 동시에 관리할 수 있습니다.
              </p>
              <Btn_1Col onClick={() => setIsFilterSheetOpen(true)}>
                Open Filter Bottom Sheet
              </Btn_1Col>
            </div>
            <div className="bg-secondary p-4 rounded-xl">
              <h4 className="mb-2">PinInputBottomSheet</h4>
              <p className="text-muted-foreground mb-3">
                비밀번호 입력을 위한 숫자 키패드가 포함된 바텀 시트입니다. PIN 입력 UI를 제공합니다.
              </p>
              <Btn_1Col onClick={() => setIsPinSheetOpen(true)}>
                Open PIN Input Bottom Sheet
              </Btn_1Col>
            </div>
          </div>
        </section>

        {/* Common Pages */}
        <section className="space-y-4">
          <h2>Common Pages</h2>
          <p className="text-sm text-muted-foreground">
            재사용 가능한 공통 페이지 컴포넌트들입니다. Props를 통해 커스터마이징할 수 있습니다.
          </p>
          <div className="space-y-3">
            <div className="bg-secondary p-4 rounded-xl">
              <h4 className="mb-2">Success</h4>
              <p className="text-muted-foreground mb-3">
                성공 상태를 표시하는 페이지입니다. 파란색 체크 아이콘과 함께 성공 메시지를 보여줍니다.
              </p>
              <div className="text-sm text-muted-foreground space-y-1 mb-3">
                <p>• Props: headerTitle, title, description?, buttonText?, onButtonClick?, redirectPath?</p>
                <p>• 위치: /src/app/pages/common/Success.tsx</p>
                <p>• 사용 예: AccountCreationComplete</p>
              </div>
            </div>
            <div className="bg-secondary p-4 rounded-xl">
              <h4 className="mb-2">Failed</h4>
              <p className="text-muted-foreground mb-3">
                실패 상태를 표시하는 페이지입니다. 빨간색 X 아이콘과 함께 실패 메시지를 보여줍니다.
              </p>
              <div className="text-sm text-muted-foreground space-y-1 mb-3">
                <p>• Props: headerTitle, title, description?, buttonText?, onButtonClick?, redirectPath?</p>
                <p>• 위치: /src/app/pages/common/Failed.tsx</p>
                <p>• 사용 예: VerificationFailed</p>
              </div>
            </div>
            <div className="bg-secondary p-4 rounded-xl">
              <h4 className="mb-2">Loading</h4>
              <p className="text-muted-foreground mb-3">
                로딩 상태를 표시하는 페이지입니다. 스피너 애니메이션과 함께 로딩 메시지를 보여줍니다.
              </p>
              <div className="text-sm text-muted-foreground space-y-1 mb-3">
                <p>• Props: headerTitle, title, description?, spinnerSize?</p>
                <p>• 위치: /src/app/pages/common/Loading.tsx</p>
                <p>• 사용 예: VerificationLoading</p>
              </div>
            </div>
            <div className="bg-secondary p-4 rounded-xl">
              <h4 className="mb-2">OneButtonTemplate</h4>
              <p className="text-muted-foreground mb-3">
                하단에 1열 버튼을 가진 페이지 템플릿입니다. 컨텐츠 영역을 children으로 전달할 수 있습니다.
              </p>
              <div className="text-sm text-muted-foreground space-y-1 mb-3">
                <p>• Props: headerTitle, showBackButton?, onBack?, headerRightContent?, children, buttonText, onButtonClick?, redirectPath?, buttonVariant?</p>
                <p>• 위치: /src/app/pages/common/OneButtonTemplate.tsx</p>
                <p>• 라우트: /one-button-template</p>
              </div>
            </div>
            <div className="bg-secondary p-4 rounded-xl">
              <h4 className="mb-2">TwoButtonTemplate</h4>
              <p className="text-muted-foreground mb-3">
                하단에 2열 버튼을 가진 페이지 템플릿입니다. 좌측/우측 버튼을 각각 설정할 수 있습니다.
              </p>
              <div className="text-sm text-muted-foreground space-y-1 mb-3">
                <p>• Props: headerTitle, showBackButton?, onBack?, headerRightContent?, children, leftButtonText, rightButtonText, onLeftClick?, onRightClick?, leftRedirectPath?, rightRedirectPath?, leftVariant?, rightVariant?</p>
                <p>• 위치: /src/app/pages/common/TwoButtonTemplate.tsx</p>
                <p>• 라우트: /two-button-template</p>
              </div>
            </div>
            <div className="bg-secondary p-4 rounded-xl">
              <h4 className="mb-2">CloseButtonTemplate</h4>
              <p className="text-muted-foreground mb-3">
                좌측 뒤로가기 없이 우측 상단에 X 닫기 버튼을 가진 페이지 템플릿입니다.
              </p>
              <div className="text-sm text-muted-foreground space-y-1 mb-3">
                <p>• Props: headerTitle, onClose?, closePath?, children, buttonText?, onButtonClick?, redirectPath?, buttonVariant?, showBottomButton?</p>
                <p>• 위치: /src/app/pages/common/CloseButtonTemplate.tsx</p>
                <p>• 라우트: /close-button-template</p>
              </div>
            </div>
          </div>
        </section>

        {/* Routing Structure */}
        <section className="space-y-4">
          <h2>Routing Structure</h2>
          <div className="space-y-2 bg-secondary p-4 rounded-xl font-mono text-sm">
            <div className="text-xs text-muted-foreground mb-2">메인 페이지</div>
            <div>/ - Demo Home (Default)</div>
            <div>/home - Demo Home</div>
            <div>/language - Language Selection</div>
            <div>/landing - Landing Page</div>
            <div>/main - Main App Page</div>

            <div className="text-xs text-muted-foreground mb-2 mt-3">인증 & 계정</div>
            <div>/login - Login Page</div>
            <div>/step-1 - Account Setup Step 1</div>
            <div>/step-2 - Account Setup Step 2</div>
            <div>/step-3 - Account Setup Step 3</div>

            <div className="text-xs text-muted-foreground mb-2 mt-3">서비스 페이지</div>
            <div>/transfer - Transfer Page</div>
            <div>/exchange - Exchange Page</div>
            <div>/mypage - My Page</div>
            <div>/transaction-history - Transaction History</div>

            <div className="text-xs text-muted-foreground mb-2 mt-3">공통 페이지 & 템플릿</div>
            <div>/loading - Loading Template</div>
            <div>/success - Success Template</div>
            <div>/failed - Failed Template</div>
            <div>/one-button-template - One Button Template</div>
            <div>/two-button-template - Two Button Template</div>
            <div>/close-button-template - Close Button Template</div>

            <div className="text-xs text-muted-foreground mb-2 mt-3">시스템</div>
            <div>/design-system - This Page</div>
          </div>
        </section>
      </div>
    </MobileLayout>

    <BottomSheet
      isOpen={isBottomSheetOpen}
      onClose={() => setIsBottomSheetOpen(false)}
      title="Bottom Sheet Demo"
    >
      <div className="space-y-4">
        <p className="text-muted-foreground">
          This is a bottom sheet component that slides up from the bottom of the screen.
        </p>
        <div className="space-y-3">
          <h4>Features:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Smooth slide-up animation</li>
            <li>✓ Backdrop dim effect</li>
            <li>✓ Handle bar for visual affordance</li>
            <li>✓ Scrollable content area</li>
            <li>✓ Max height: 80vh</li>
            <li>✓ Close on backdrop click</li>
          </ul>
        </div>
        <Btn_1Col onClick={() => setIsBottomSheetOpen(false)}>
          Close
        </Btn_1Col>
      </div>
    </BottomSheet>

    <FilterBottomSheet
      isOpen={isFilterSheetOpen}
      onClose={() => setIsFilterSheetOpen(false)}
      sections={[
        {
          title: '조회 기간',
          options: [
            { value: '전체', label: '전체' },
            { value: '1개월', label: '1개월' },
            { value: '3개월', label: '3개월' },
            { value: '6개월', label: '6개월' },
          ],
          selectedValue: selectedPeriod,
          onSelect: setSelectedPeriod,
        },
        {
          title: '거래 유형',
          options: [
            { value: '전체', label: '전체' },
            { value: '입금', label: '입금' },
            { value: '출금', label: '출금' },
            { value: '송금', label: '송금' },
            { value: '환전', label: '환전' },
          ],
          selectedValue: selectedType,
          onSelect: setSelectedType,
        },
      ]}
      onApply={() => {
        setIsFilterSheetOpen(false);
        console.log('Filter applied:', { period: selectedPeriod, type: selectedType });
      }}
    />

    <PinInputBottomSheet
      isOpen={isPinSheetOpen}
      onClose={() => setIsPinSheetOpen(false)}
      onComplete={(pin) => {
        console.log('PIN entered:', pin);
        setTimeout(() => setIsPinSheetOpen(false), 300);
      }}
    />
  </>
  );
}
