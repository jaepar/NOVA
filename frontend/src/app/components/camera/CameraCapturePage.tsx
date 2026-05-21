import { ReactNode } from "react";
import { MobileLayout } from "../layout/MobileLayout";

interface CameraCapturePageProps {
  title: string;
  children: ReactNode;
  bottomContent?: ReactNode;
  onClose?: () => void;
  closePath?: string;
  bottomBackgroundColor?: string;
}

export function CameraCapturePage({
  title,
  children,
  bottomContent,
  onClose,
  closePath,
  bottomBackgroundColor = "#000000",
}: CameraCapturePageProps) {
  return (
    <MobileLayout
      title={title}
      headerType="close"
      onClose={onClose}
      closePath={closePath}
      headerBackgroundColor="#000000"
      headerTextColor="#ffffff"
      bottomBackgroundColor={bottomBackgroundColor}
      bottomContent={bottomContent}
    >
      <div className="min-h-full -mx-5 -mb-32 px-5 pb-32 bg-black text-white">{children}</div>
    </MobileLayout>
  );
}
