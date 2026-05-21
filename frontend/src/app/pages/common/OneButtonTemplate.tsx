import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '../../components/layout/MobileLayout';
import { Btn_1Col } from '../../components/design-system/Btn_1Col';

interface OneButtonTemplateProps {
  headerTitle: string;
  headerType?: 'back' | 'close';
  showBackButton?: boolean;
  onBack?: () => void;
  backPath?: string;
  onClose?: () => void;
  closePath?: string;
  headerRightContent?: ReactNode;
  children: ReactNode;
  buttonText: string;
  onButtonClick?: () => void;
  redirectPath?: string;
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export function OneButtonTemplate({
  headerTitle,
  headerType = 'back',
  showBackButton = true,
  onBack,
  backPath,
  onClose,
  closePath,
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
      headerType={headerType}
      showBackButton={showBackButton}
      onBack={onBack}
      backPath={backPath}
      onClose={onClose}
      closePath={closePath}
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
