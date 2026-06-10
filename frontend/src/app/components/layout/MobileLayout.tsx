import { ReactNode } from 'react'
import { FixedHeader } from './FixedHeader'
import { CloseFixedHeader } from './CloseFixedHeader'
import { TitleOnlyFixedHeader } from './TitleOnlyFixedHeader'
import { FloatingBottom } from './FloatingBottom'

interface MobileLayoutProps {
  title: string
  children: ReactNode
  bottomContent?: ReactNode
  bottomBackgroundColor?: string
  headerBackgroundColor?: string
  headerTextColor?: string
  headerType?: 'back' | 'close' | 'none'
  showBackButton?: boolean
  showCloseButton?: boolean
  onBack?: () => void
  backPath?: string
  onClose?: () => void
  closePath?: string
  headerLeftContent?: ReactNode
  headerRightContent?: ReactNode
}

export function MobileLayout({
  title,
  children,
  bottomContent,
  bottomBackgroundColor = '#ffffff',
  headerBackgroundColor = '#ffffff',
  headerTextColor = '#000000',
  headerType = 'back',
  showBackButton,
  showCloseButton,
  onBack,
  backPath,
  onClose,
  closePath,
  headerLeftContent,
  headerRightContent,
}: MobileLayoutProps) {
  const effectiveHeaderType: 'back' | 'close' | 'none' =
    headerType === 'none'
      ? 'none'
      : headerType === 'close' ||
          (showBackButton === false &&
            showCloseButton !== false &&
            !headerLeftContent &&
            !headerRightContent)
        ? 'close'
        : 'back'

  return (
    <div className="relative h-full w-full bg-background flex flex-col overflow-hidden">
      {effectiveHeaderType === 'close' ? (
        <CloseFixedHeader
          title={title}
          onClose={onClose}
          closePath={closePath}
          backgroundColor={headerBackgroundColor}
          textColor={headerTextColor}
        />
      ) : effectiveHeaderType === 'none' ? (
        <TitleOnlyFixedHeader
          title={title}
          backgroundColor={headerBackgroundColor}
          textColor={headerTextColor}
        />
      ) : (
        <FixedHeader
          title={title}
          onBack={onBack}
          backPath={backPath}
          backgroundColor={headerBackgroundColor}
          textColor={headerTextColor}
          showBackButton={showBackButton}
          leftContent={headerLeftContent}
          rightContent={headerRightContent}
        />
      )}

      <main
        className="flex-1 pb-32 px-5 w-full overflow-y-auto"
        style={{ paddingTop: 'var(--app-content-offset)' }}
      >
        {children}
      </main>

      {bottomContent && (
        <FloatingBottom backgroundColor={bottomBackgroundColor}>{bottomContent}</FloatingBottom>
      )}
    </div>
  )
}
