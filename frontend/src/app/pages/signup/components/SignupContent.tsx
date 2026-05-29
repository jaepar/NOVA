import type { ReactNode } from "react";

interface SignupContentProps {
  children: ReactNode;
  className?: string;
}

export function SignupContent({
  children,
  className = "",
}: SignupContentProps) {
  return <div className={`pt-2 ${className}`.trim()}>{children}</div>;
}
