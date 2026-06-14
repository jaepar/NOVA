import { Home, Send, TrendingUp, User } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppButton } from '../design-system/AppButton'
import { useTranslation } from '../../i18n'

interface NavItem {
  id: string
  labelKey: string
  icon: React.ReactNode
  path: string
}

const navItems: NavItem[] = [
  { id: 'home', labelKey: 'bottomNav.home', icon: <Home className="w-6 h-6" />, path: '/main' },
  { id: 'transfer', labelKey: 'bottomNav.transfer', icon: <Send className="w-6 h-6" />, path: '/global-transfer' },
  { id: 'exchange', labelKey: 'bottomNav.exchange', icon: <TrendingUp className="w-6 h-6" />, path: '/exchange' },
  { id: 'mypage', labelKey: 'bottomNav.mypage', icon: <User className="w-6 h-6" />, path: '/mypage' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-30 h-[112px] bg-white" aria-hidden="true" />
      <div className="fixed bottom-5 left-0 right-0 z-40 w-full px-5">
      <div
        className="relative bg-background/95 backdrop-blur-[20px] px-2 py-3 rounded-2xl shadow-lg border border-border/50 w-full"
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive =
              item.path === '/global-transfer'
                ? location.pathname === item.path || location.pathname.startsWith('/global-transfer/')
                : location.pathname === item.path
            return (
              <AppButton
                variant="unstyled"
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.icon}
                <span className="text-xs">{t(item.labelKey)}</span>
              </AppButton>
            )
          })}
        </div>
      </div>
      </div>
    </>
  )
}
