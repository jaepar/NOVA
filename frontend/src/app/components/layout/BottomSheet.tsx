import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  bottomAction?: React.ReactNode;
  height?: string;
  disableScroll?: boolean;
}

export function BottomSheet({ isOpen, onClose, title, children, bottomAction, height, disableScroll = false }: BottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      // Delay hiding to allow slide-down animation
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Bottom Sheet Template */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[70] bg-background rounded-t-3xl w-full max-w-[390px] mx-auto transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          height: height || 'auto',
          maxHeight: '80vh',
        }}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-border rounded-full"></div>
        </div>

        {/* Header - Always Visible */}
        <div className="flex items-center justify-between px-5 py-3">
          <h3>{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className={`flex-1 px-5 py-6 ${disableScroll ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {children}
        </div>

        {/* Bottom Action Area - Fixed at bottom */}
        {bottomAction && (
          <div className="px-5 pb-5">
            <div
              className="bg-background/95 backdrop-blur-[20px] p-4 rounded-2xl border border-border/50"
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              {bottomAction}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
