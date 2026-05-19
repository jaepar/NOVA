import { useNavigate } from "react-router-dom";
import { FixedHeader } from '../../components/layout/FixedHeader';
import { FloatingBottom } from '../../components/layout/FloatingBottom';
import { Btn_1Col } from '../../components/design-system/Btn_1Col';
import { Check } from 'lucide-react';

interface SuccessProps {
  headerTitle: string;
  title: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  redirectPath?: string;
}

export function Success({
  headerTitle,
  title,
  description,
  buttonText = '확인',
  onButtonClick,
  redirectPath = '/main',
}: SuccessProps) {
  const navigate = useNavigate();

  const handleConfirm = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      navigate(redirectPath);
    }
  };

  return (
    <div className="h-screen w-full max-w-[390px] mx-auto bg-background flex flex-col overflow-hidden">
      <FixedHeader title={headerTitle} />

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 relative">
          {/* Success icon */}
          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center">
            <Check className="w-14 h-14 text-white stroke-[4]" />
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
        <Btn_1Col variant="primary" onClick={handleConfirm}>
          {buttonText}
        </Btn_1Col>
      </FloatingBottom>
    </div>
  );
}
