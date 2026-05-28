import { ReactNode } from 'react'
import { MobileLayout } from '../layout/MobileLayout'

interface CameraCapturePageProps {
  title: string
  children: ReactNode
  bottomContent?: ReactNode
  onClose?: () => void
  closePath?: string
  headerBackgroundColor?: string
  headerTextColor?: string
  bottomBackgroundColor?: string
  contentBackgroundColor?: string
  contentTextColor?: string
}

export function CameraCapturePage({
  title,
  children,
  bottomContent,
  onClose,
  closePath,
  headerBackgroundColor = '#000000',
  headerTextColor = '#ffffff',
  bottomBackgroundColor = '#000000',
  contentBackgroundColor = '#000000',
  contentTextColor = '#ffffff',
}: CameraCapturePageProps) {
  return (
    <MobileLayout
      title={title}
      headerType="close"
      onClose={onClose}
      closePath={closePath}
      headerBackgroundColor={headerBackgroundColor}
      headerTextColor={headerTextColor}
      bottomBackgroundColor={bottomBackgroundColor}
      bottomContent={bottomContent}
    >
      <div
        className="min-h-full -mx-5 -mb-32 px-5 pb-32"
        style={{ backgroundColor: contentBackgroundColor, color: contentTextColor }}
      >
        {children}
      </div>
    </MobileLayout>
  )
}
