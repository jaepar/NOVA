import { Home, Send, TrendingUp, User } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppButton } from '../design-system/AppButton'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
}

const navItems: NavItem[] = [
  { id: 'home', label: '홈', icon: <Home className="w-6 h-6" />, path: '/main' },
  { id: 'transfer', label: '송금', icon: <Send className="w-6 h-6" />, path: '/global-transfer' },
  { id: 'exchange', label: '환율', icon: <TrendingUp className="w-6 h-6" />, path: '/exchange' },
  { id: 'mypage', label: '마이페이지', icon: <User className="w-6 h-6" />, path: '/mypage' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="fixed bottom-5 left-0 right-0 z-40 w-full px-5">
      <div
        className="bg-background/95 backdrop-blur-[20px] px-2 py-3 rounded-2xl shadow-lg border border-border/50 w-full"
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
                <span className="text-xs">{item.label}</span>
              </AppButton>
            )
          })}
        </div>
      </div>
    </div>
  )
}
