import { MobileLayout } from "../components/layout/MobileLayout";
import { BottomSheet } from "../components/layout/BottomSheet";
import { CommonInputGroup } from "../components/design-system/CommonInputGroup";
import { Btn_1Col } from "../components/design-system/Btn_1Col";
import { Btn_2Col } from "../components/design-system/Btn_2Col";
import { FilterBottomSheet } from "../components/design-system/FilterBottomSheet";
import { PinInputBottomSheet } from "../components/design-system/PinInputBottomSheet";
import { Spinner } from "../components/design-system/Spinner";
import { spacing, typography, layout, header, bottomSheet, scrollbar } from "../components/design-system/tokens";
import { useDesignSystemPageStore } from "../stores/pageStores";

export function DesignSystem() {
  const inputValue = useDesignSystemPageStore((state) => state.inputValue);
  const isBottomSheetOpen = useDesignSystemPageStore((state) => state.isBottomSheetOpen);
  const isFilterSheetOpen = useDesignSystemPageStore((state) => state.isFilterSheetOpen);
  const isPinSheetOpen = useDesignSystemPageStore((state) => state.isPinSheetOpen);
  const selectedPeriod = useDesignSystemPageStore((state) => state.selectedPeriod);
  const selectedType = useDesignSystemPageStore((state) => state.selectedType);
  const setInputValue = useDesignSystemPageStore((state) => state.setInputValue);
  const setBottomSheetOpen = useDesignSystemPageStore((state) => state.setBottomSheetOpen);
  const setFilterSheetOpen = useDesignSystemPageStore((state) => state.setFilterSheetOpen);
  const setPinSheetOpen = useDesignSystemPageStore((state) => state.setPinSheetOpen);
  const setSelectedPeriod = useDesignSystemPageStore((state) => state.setSelectedPeriod);
  const setSelectedType = useDesignSystemPageStore((state) => state.setSelectedType);

  return (
    <>
      <MobileLayout title="Design System" headerType="close">
        <div className="space-y-8 pb-8">
          <section className="space-y-4">
            <h2>Typography</h2>
            <div className="space-y-2 rounded-xl bg-secondary p-4">
              <p>2xl: {typography["2xl"]} (24px)</p>
              <p>xl: {typography.xl} (20px)</p>
              <p>lg: {typography.lg} (18px)</p>
              <p>base: {typography.base} (16px)</p>
              <p>sm: {typography.sm} (14px)</p>
              <p>xs: {typography.xs} (12px)</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2>Spacing</h2>
            <div className="space-y-2 rounded-xl bg-secondary p-4">
              <p>xs: {spacing.xs}</p>
              <p>sm: {spacing.sm}</p>
              <p>md: {spacing.md}</p>
              <p>lg: {spacing.lg}</p>
              <p>xl: {spacing.xl}</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2>Layout Rules</h2>
            <div className="space-y-2 rounded-xl bg-secondary p-4 text-sm text-muted-foreground">
              <p>- Required page scaffold: MobileLayout</p>
              <p>- Header top padding: {header.paddingTop}</p>
              <p>- Header height: {header.height}</p>
              <p>- Content offset: {header.contentOffset}</p>
              <p>- Horizontal content padding: {layout.contentPaddingX}</p>
              <p>- Bottom content padding: {layout.contentPaddingBottom}</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2>Scrollbar</h2>
            <div className="space-y-2 rounded-xl bg-secondary p-4 text-sm text-muted-foreground">
              <p>- Display: {scrollbar.display}</p>
              <p>- Behavior: {scrollbar.behavior}</p>
              <p>- Utility class: .{scrollbar.utilityClass}</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2>Input</h2>
            <CommonInputGroup
              label="Full Name"
              placeholder="Enter your name"
              value={inputValue}
              onChange={setInputValue}
            />
          </section>

          <section className="space-y-4">
            <h2>Buttons</h2>
            <div className="space-y-3">
              <Btn_1Col variant="primary">Primary</Btn_1Col>
              <Btn_1Col variant="secondary">Secondary</Btn_1Col>
              <Btn_1Col variant="outline">Outline</Btn_1Col>
              <Btn_2Col leftLabel="Cancel" rightLabel="Confirm" />
            </div>
          </section>

          <section className="space-y-4">
            <h2>Spinner</h2>
            <div className="rounded-xl bg-secondary p-6">
              <div className="flex items-center justify-center gap-8">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2>Bottom Sheet</h2>
            <div className="space-y-2 rounded-xl bg-secondary p-4 text-sm text-muted-foreground">
              <p>- Base height: {bottomSheet.height}</p>
              <p>- Max height: {bottomSheet.maxHeight}</p>
              <p>- Radius: {bottomSheet.borderRadius}</p>
              <p>- Header padding: {bottomSheet.headerPadding}</p>
              <p>- Content padding: {bottomSheet.contentPadding}</p>
            </div>
            <Btn_1Col onClick={() => setBottomSheetOpen(true)}>Open Basic Bottom Sheet</Btn_1Col>
            <Btn_1Col onClick={() => setFilterSheetOpen(true)}>Open Filter Bottom Sheet</Btn_1Col>
            <Btn_1Col onClick={() => setPinSheetOpen(true)}>Open PIN Bottom Sheet</Btn_1Col>
          </section>
        </div>
      </MobileLayout>

      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        title="Bottom Sheet Demo"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">Shared BottomSheet template demo.</p>
          <Btn_1Col onClick={() => setBottomSheetOpen(false)}>Close</Btn_1Col>
        </div>
      </BottomSheet>

      <FilterBottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        sections={[
          {
            title: "Period",
            options: [
              { value: "all", label: "All" },
              { value: "1m", label: "1 Month" },
              { value: "3m", label: "3 Months" },
              { value: "6m", label: "6 Months" },
            ],
            selectedValue: selectedPeriod,
            onSelect: setSelectedPeriod,
          },
          {
            title: "Transaction Type",
            options: [
              { value: "all", label: "All" },
              { value: "deposit", label: "Deposit" },
              { value: "withdrawal", label: "Withdrawal" },
              { value: "transfer", label: "Transfer" },
              { value: "exchange", label: "Exchange" },
            ],
            selectedValue: selectedType,
            onSelect: setSelectedType,
          },
        ]}
        onApply={() => setFilterSheetOpen(false)}
      />

      <PinInputBottomSheet
        isOpen={isPinSheetOpen}
        onClose={() => setPinSheetOpen(false)}
        onComplete={() => {
          setTimeout(() => setPinSheetOpen(false), 300);
        }}
      />
    </>
  );
}

