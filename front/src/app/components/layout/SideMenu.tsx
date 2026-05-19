import { useEffect, useState } from 'react';
import { X, User, Settings, HelpCircle, LogOut, LogIn } from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onLogin?: () => void;
}

export function SideMenu({ isOpen, onClose, isLoggedIn = false, onLogout, onLogin }: SideMenuProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const menuItems = [
    { icon: <User className="w-5 h-5" />, label: '프로필', onClick: () => {} },
    { icon: <Settings className="w-5 h-5" />, label: '설정', onClick: () => {} },
    { icon: <HelpCircle className="w-5 h-5" />, label: '고객센터', onClick: () => {} },
    isLoggedIn
      ? { icon: <LogOut className="w-5 h-5" />, label: '로그아웃', onClick: onLogout || (() => {}) }
      : { icon: <LogIn className="w-5 h-5" />, label: '로그인', onClick: onLogin || (() => {}) },
  ];

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Side Menu */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[280px] bg-background z-50 shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2>메뉴</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-4">
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-secondary rounded-xl transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">NOVA v1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
}
