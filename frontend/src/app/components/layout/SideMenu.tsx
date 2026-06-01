import { useEffect, useMemo } from 'react'
import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'
import { X, User, Settings, HelpCircle, LogOut, LogIn } from 'lucide-react'
import { AppButton } from '../design-system/AppButton'

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
  isLoggedIn?: boolean
  onLogout?: () => void
  onLogin?: () => void
  onProfile?: () => void
}

export function SideMenu({
  isOpen,
  onClose,
  isLoggedIn = false,
  onLogout,
  onLogin,
  onProfile,
}: SideMenuProps) {
  const visibilityStore = useMemo(
    () =>
      createStore<{ isVisible: boolean; setIsVisible: (next: boolean) => void }>((set) => ({
        isVisible: false,
        setIsVisible: (next) => set({ isVisible: next }),
      })),
    []
  )
  const isVisible = useStore(visibilityStore, (state) => state.isVisible)
  const setIsVisible = useStore(visibilityStore, (state) => state.setIsVisible)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const menuItems = [
    { icon: <User className="w-5 h-5" />, label: '프로필', onClick: onProfile || (() => {}) },
    { icon: <Settings className="w-5 h-5" />, label: '설정', onClick: () => {} },
    { icon: <HelpCircle className="w-5 h-5" />, label: '고객센터', onClick: () => {} },
    isLoggedIn
      ? { icon: <LogOut className="w-5 h-5" />, label: '로그아웃', onClick: onLogout || (() => {}) }
      : { icon: <LogIn className="w-5 h-5" />, label: '로그인', onClick: onLogin || (() => {}) },
  ]

  if (!isVisible) return null

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
            <AppButton
              variant="unstyled"
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </AppButton>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-4">
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <AppButton
                  variant="unstyled"
                  key={index}
                  onClick={() => {
                    item.onClick()
                    onClose()
                  }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-secondary rounded-xl transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </AppButton>
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
  )
}
