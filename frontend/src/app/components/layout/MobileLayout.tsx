import { ReactNode } from 'react';
import { FixedHeader } from './FixedHeader';
import { FloatingBottom } from './FloatingBottom';

interface MobileLayoutProps {
  title: string;
  children: ReactNode;
  bottomContent?: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  headerRightContent?: ReactNode;
}

export function MobileLayout({
  title,
  children,
  bottomContent,
  showBackButton = true,
  onBack,
  headerRightContent
}: MobileLayoutProps) {
  return (
    <div className="h-full w-full bg-background flex flex-col overflow-hidden">
      <FixedHeader
        title={title}
        showBackButton={showBackButton}
        onBack={onBack}
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
