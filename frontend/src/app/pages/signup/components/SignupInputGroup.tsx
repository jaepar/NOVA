import type { InputHTMLAttributes, ReactNode } from "react";

interface SignupInputGroupProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  disabled?: boolean;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  autoComplete?: string;
  rightContent?: ReactNode;
}

export function SignupInputGroup({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  disabled = false,
  inputMode,
  maxLength,
  autoComplete,
  rightContent,
}: SignupInputGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="block">{label}</label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          disabled={disabled}
          inputMode={inputMode}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className={`w-full rounded-lg border border-border bg-input-background py-3 pl-4 ${
            rightContent ? "pr-32" : "pr-4"
          } transition-all focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60`}
          style={{ fontSize: "16px" }}
        />
        {rightContent && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightContent}</div>
        )}
      </div>
    </div>
  );
}
