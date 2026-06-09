type InlineBannerVariant = "success" | "error" | "info" | "warning";

type InlineBannerProps = {
  message: string;
  variant?: InlineBannerVariant;
  className?: string;
};

const variantClassMap: Record<InlineBannerVariant, string> = {
  success: "border-emerald-400/60 bg-emerald-500/10 text-emerald-900",
  error: "border-red-400/50 bg-red-500/10 text-black",
  info: "border-blue-400/60 bg-blue-500/10 text-blue-900",
  warning: "border-amber-400/60 bg-amber-500/15 text-amber-900",
};

export function InlineBanner({
  message,
  variant = "error",
  className,
}: InlineBannerProps) {
  return (
    <div
      className={`rounded-xl border p-3 text-center text-sm ${variantClassMap[variant]} ${
        className ?? ""
      }`}
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

