import { Eye, EyeOff } from "lucide-react";
import { AppButton } from "../../../components/design-system/AppButton";
import { useTranslation } from "../../../i18n";

interface PasswordInputGroupProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
}

export function PasswordInputGroup({
  label,
  placeholder,
  value,
  onChange,
  visible,
  onToggleVisible,
}: PasswordInputGroupProps) {
  const { t } = useTranslation();
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="flex flex-col gap-2">
      <label className="block">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full pl-4 pr-12 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all mx-[0px] mt-[6px] mb-[0px]"
          style={{ fontSize: "16px" }}
        />
        <AppButton
          type="button"
          variant="unstyled"
          onClick={onToggleVisible}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-foreground"
          aria-label={visible ? t('login.hidePassword') : t('login.showPassword')}
        >
          <Icon className="h-5 w-5" />
        </AppButton>
      </div>
    </div>
  );
}
