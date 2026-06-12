import { AppButton } from "./AppButton";

interface Btn2ColProps {
  leftLabel: string;
  rightLabel: string;
  onLeftClick?: () => void;
  onRightClick?: () => void;
  leftVariant?: "primary" | "secondary" | "outline";
  rightVariant?: "primary" | "secondary" | "outline";
  rightDisabled?: boolean;
}

export function Btn_2Col({
  leftLabel,
  rightLabel,
  onLeftClick,
  onRightClick,
  leftVariant = "outline",
  rightVariant = "primary",
  rightDisabled = false,
}: Btn2ColProps) {
  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary-dark border-2 border-primary disabled:bg-secondary disabled:text-muted-foreground disabled:border-border disabled:hover:bg-secondary",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-accent border-2 border-secondary disabled:bg-secondary disabled:text-muted-foreground disabled:border-border disabled:hover:bg-secondary",
    outline:
      "bg-background border-2 border-border text-foreground hover:bg-secondary disabled:bg-secondary disabled:text-muted-foreground disabled:border-border disabled:hover:bg-secondary",
  };

  return (
    <div className="flex gap-4 w-full">
      <AppButton
        onClick={onLeftClick}
        variant="unstyled"
        className={`flex-1 py-4 px-6 rounded-xl transition-all disabled:cursor-not-allowed ${variants[leftVariant]}`}
      >
        {leftLabel}
      </AppButton>
      <AppButton
        onClick={onRightClick}
        disabled={rightDisabled}
        variant="unstyled"
        className={`flex-1 py-4 px-6 rounded-xl transition-all disabled:cursor-not-allowed ${variants[rightVariant]}`}
      >
        {rightLabel}
      </AppButton>
    </div>
  );
}
