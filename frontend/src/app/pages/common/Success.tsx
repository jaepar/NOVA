import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";

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
  buttonText = "확인",
  onButtonClick,
  redirectPath = "/main",
}: SuccessProps) {
  const navigate = useNavigate();

  const handleConfirm = () => {
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
        <Btn_1Col variant="primary" onClick={handleConfirm}>
          {buttonText}
        </Btn_1Col>
      }
    >
      <div className="flex h-full flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600">
            <Check className="h-14 w-14 stroke-[4] text-white" />
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
