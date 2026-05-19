import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppButton } from '../design-system/AppButton';

interface FixedHeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export function FixedHeader({ title, onBack, showBackButton = true, leftContent, rightContent }: FixedHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-background w-full"
      style={{ paddingTop: 'var(--app-header-top-padding)' }}
    >
      <div
        className="flex items-center justify-between px-5"
        style={{ height: 'var(--app-header-height)' }}
      >
        {showBackButton && (
          <AppButton
            variant="unstyled"
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </AppButton>
        )}
        {!showBackButton && (
          leftContent ? <div className="w-10 flex justify-start">{leftContent}</div> : <div className="w-10" />
        )}

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
