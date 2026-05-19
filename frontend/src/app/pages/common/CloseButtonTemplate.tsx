import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { MobileLayout } from '../../components/layout/MobileLayout';
import { AppButton } from '../../components/design-system/AppButton';
import { Btn_1Col } from '../../components/design-system/Btn_1Col';

interface CloseButtonTemplateProps {
  headerTitle: string;
  onClose?: () => void;
  closePath?: string;
  children: ReactNode;
  buttonText?: string;
  onButtonClick?: () => void;
  redirectPath?: string;
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  showBottomButton?: boolean;
}

export function CloseButtonTemplate({
  headerTitle,
  onClose,
  closePath = '/',
  children,
  buttonText,
  onButtonClick,
  redirectPath,
  buttonVariant = 'primary',
  showBottomButton = false,
}: CloseButtonTemplateProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(closePath);
    }
  };

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (redirectPath) {
      navigate(redirectPath);
    }
  };

  return (
    <MobileLayout
      title={headerTitle}
      showBackButton={false}
      headerRightContent={
        <AppButton
          variant="unstyled"
          onClick={handleClose}
          className="p-2 -mr-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </AppButton>
      }
      bottomContent={
        showBottomButton && buttonText ? (
          <Btn_1Col onClick={handleButtonClick} variant={buttonVariant}>
            {buttonText}
          </Btn_1Col>
        ) : undefined
      }
    >
      {children}
    </MobileLayout>
  );
}
