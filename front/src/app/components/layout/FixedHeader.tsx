import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FixedHeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
  rightContent?: React.ReactNode;
}

export function FixedHeader({ title, onBack, showBackButton = true, rightContent }: FixedHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background pt-5 w-full max-w-[390px] mx-auto">
      <div className="flex items-center justify-between px-5 h-14">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {!showBackButton && <div className="w-10" />}

        <h1 className="flex-1 text-center font-medium">{title}</h1>

        {rightContent ? (
          <div className="w-10 flex justify-end">{rightContent}</div>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </header>
  );
}
