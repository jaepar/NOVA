import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";

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
  buttonText = "다시 시도",
  onButtonClick,
  redirectPath = "/",
}: FailedProps) {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (onButtonClick) {
      onButtonClick();
      return;
    }
    navigate(redirectPath);
  };

  return (
    <MobileLayout
      title={headerTitle}
      bottomContent={
        <Btn_1Col variant="primary" onClick={handleRetry}>
          {buttonText}
        </Btn_1Col>
      }
    >
      <div className="flex h-full flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <X className="h-10 w-10 stroke-[3] text-red-500" />
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
