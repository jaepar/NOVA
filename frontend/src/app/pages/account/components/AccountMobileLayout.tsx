import type { ComponentProps } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../../components/layout/MobileLayout";

type AccountMobileLayoutProps = ComponentProps<typeof MobileLayout>;

export function AccountMobileLayout({
  onBack,
  backPath,
  onClose,
  closePath,
  ...props
}: AccountMobileLayoutProps) {
  const navigate = useNavigate();

  const resolvedOnBack =
    onBack ?? (backPath ? () => navigate(backPath, { replace: true }) : undefined);
  const resolvedOnClose =
    onClose ?? (closePath ? () => navigate(closePath, { replace: true }) : undefined);

  return (
    <MobileLayout
      {...props}
      backPath={backPath}
      closePath={closePath}
      onBack={resolvedOnBack}
      onClose={resolvedOnClose}
    />
  );
}
