import { BottomSheet } from '../layout/BottomSheet';
import { AppButton } from './AppButton';
import { Btn_1Col } from './Btn_1Col';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSection {
  title: string;
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  sections: FilterSection[];
  onApply: () => void;
  applyButtonText?: string;
}

export function FilterBottomSheet({
  isOpen,
  onClose,
  title = '필터',
  sections,
  onApply,
  applyButtonText = '적용하기',
}: FilterBottomSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      height="520px"
      bottomAction={
        <Btn_1Col onClick={onApply}>{applyButtonText}</Btn_1Col>
      }
    >
      <div className="space-y-6 pb-4">
        {sections.map((section, index) => (
          <div key={index} className="space-y-3">
            <h4>{section.title}</h4>
            <div className="flex flex-wrap gap-2">
              {section.options.map((option) => (
                <AppButton
                  variant="unstyled"
                  key={option.value}
                  onClick={() => section.onSelect(option.value)}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    section.selectedValue === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {option.label}
                </AppButton>
              ))}
            </div>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
