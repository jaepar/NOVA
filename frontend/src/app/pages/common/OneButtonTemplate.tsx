import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '../../components/layout/MobileLayout';
import { Btn_1Col } from '../../components/design-system/Btn_1Col';

interface OneButtonTemplateProps {
  headerTitle: string;
  showBackButton?: boolean;
  onBack?: () => void;
  headerRightContent?: ReactNode;
  children: ReactNode;
  buttonText: string;
  onButtonClick?: () => void;
  redirectPath?: string;
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export function OneButtonTemplate({
  headerTitle,
  showBackButton = true,
  onBack,
  headerRightContent,
  children,
  buttonText,
  onButtonClick,
  redirectPath,
  buttonVariant = 'primary',
}: OneButtonTemplateProps) {
  const navigate = useNavigate();

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
      showBackButton={showBackButton}
      onBack={onBack}
      headerRightContent={headerRightContent}
      bottomContent={
        <Btn_1Col onClick={handleButtonClick} variant={buttonVariant}>
          {buttonText}
        </Btn_1Col>
      }
    >
      {children}
    </MobileLayout>
  );
}
