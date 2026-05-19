import { ReactNode } from 'react';
import { FixedHeader } from './FixedHeader';
import { FloatingBottom } from './FloatingBottom';

interface MobileLayoutProps {
  title: string;
  children: ReactNode;
  bottomContent?: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  headerLeftContent?: ReactNode;
  headerRightContent?: ReactNode;
}

export function MobileLayout({
  title,
  children,
  bottomContent,
  showBackButton = true,
  onBack,
  headerLeftContent,
  headerRightContent
}: MobileLayoutProps) {
  return (
    <div className="h-full w-full bg-background flex flex-col overflow-hidden">
      <FixedHeader
        title={title}
        showBackButton={showBackButton}
        onBack={onBack}
        leftContent={headerLeftContent}
        rightContent={headerRightContent}
      />

      <main
        className="flex-1 pb-32 px-5 w-full overflow-y-auto"
        style={{ paddingTop: 'var(--app-content-offset)' }}
      >
        {children}
      </main>

      {bottomContent && (
        <FloatingBottom>
          {bottomContent}
        </FloatingBottom>
      )}
    </div>
  );
}
