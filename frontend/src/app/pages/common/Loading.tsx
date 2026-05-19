import { FixedHeader } from '../../components/layout/FixedHeader';
import { Spinner } from '../../components/design-system/Spinner';

interface LoadingProps {
  headerTitle: string;
  title: string;
  description?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
}

export function Loading({
  headerTitle,
  title,
  description,
  spinnerSize = 'lg',
}: LoadingProps) {
  return (
    <div className="h-screen w-full max-w-[390px] mx-auto bg-background flex flex-col overflow-hidden">
      <FixedHeader title={headerTitle} />

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-8">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-gray-500">
                {description}
              </p>
            )}
          </div>

          <Spinner size={spinnerSize} />
        </div>
      </div>
    </div>
  );
}
