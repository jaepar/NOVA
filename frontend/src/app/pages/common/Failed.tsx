import { useNavigate } from "react-router-dom";
import { FixedHeader } from '../../components/layout/FixedHeader';
import { FloatingBottom } from '../../components/layout/FloatingBottom';
import { Btn_1Col } from '../../components/design-system/Btn_1Col';
import { X } from 'lucide-react';

interface FailedProps {
  headerTitle: string;
  title: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  redirectPath?: string;
}

export function Failed({
  headerTitle,
  title,
  description,
  buttonText = '다시 시도',
  onButtonClick,
  redirectPath = '/',
}: FailedProps) {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      navigate(redirectPath);
    }
  };

  return (
    <div className="h-full w-full bg-background flex flex-col overflow-hidden">
      <FixedHeader title={headerTitle} />

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
            <X className="w-10 h-10 text-red-500 stroke-[3]" />
          </div>

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
        </div>
      </div>

      <FloatingBottom>
        <Btn_1Col variant="primary" onClick={handleRetry}>
          {buttonText}
        </Btn_1Col>
      </FloatingBottom>
    </div>
  );
}
