import { MobileLayout } from "../../components/layout/MobileLayout";
import { Spinner } from "../../components/design-system/Spinner";

interface LoadingProps {
  headerTitle: string;
  title: string;
  description?: string;
  spinnerSize?: "sm" | "md" | "lg";
}

export function Loading({
  headerTitle,
  title,
  description,
  spinnerSize = "lg",
}: LoadingProps) {
  return (
    <MobileLayout title={headerTitle}>
      <div className="flex h-full flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-8">
          <div className="space-y-2 text-center">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>

          <Spinner size={spinnerSize} />
        </div>
      </div>
    </MobileLayout>
  );
}
