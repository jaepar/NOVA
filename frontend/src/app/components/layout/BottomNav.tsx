import { lazy, Suspense, useEffect, useState } from 'react'
import { Home, Send, TrendingUp, User } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppButton } from '../design-system/AppButton'
import { novaToast } from '../design-system/toast'
import { useTranslation } from '../../i18n'
import { userApi } from '../../../api/endpoints/user'

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

const LazyBottomSheet = lazy(async () => {
  const module = await import('./BottomSheet')

  return { default: module.BottomSheet }
})

const LazyResidenceCardRequiredSheetContent = lazy(async () => {
  const module = await import('./ResidenceCardRequiredSheetContent')

  return { default: module.ResidenceCardRequiredSheetContent }
})

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [isResidenceCardSheetOpen, setResidenceCardSheetOpen] = useState(false)
  const [hasLoadedResidenceCardSheet, setHasLoadedResidenceCardSheet] = useState(false)
  const [isTransferEligibilityChecking, setTransferEligibilityChecking] = useState(false)

  useEffect(() => {
    if (isResidenceCardSheetOpen) {
      setHasLoadedResidenceCardSheet(true)
    }
  }, [isResidenceCardSheetOpen])

  const handleRegisterResidenceCard = () => {
    setResidenceCardSheetOpen(false)
    navigate('/foreigner-card/step-01')
  }

  const handleNavClick = async (item: NavItem) => {
    if (item.id !== 'transfer') {
      navigate(item.path)
      return
    }

    if (isTransferEligibilityChecking) {
      return
    }

    setTransferEligibilityChecking(true)

    try {
      const profile = await userApi.getProfile()

      if (!profile.hasResidenceCard) {
        setResidenceCardSheetOpen(true)
        return
      }

      navigate(item.path)
    } catch {
      novaToast.error(t('main.retryLater'))
    } finally {
      setTransferEligibilityChecking(false)
    }
  }

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
                onClick={() => handleNavClick(item)}
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
      {hasLoadedResidenceCardSheet ? (
        <Suspense fallback={null}>
          <LazyBottomSheet
            isOpen={isResidenceCardSheetOpen}
            onClose={() => setResidenceCardSheetOpen(false)}
            title=""
          >
            <Suspense fallback={null}>
              <LazyResidenceCardRequiredSheetContent
                onLaterClick={() => setResidenceCardSheetOpen(false)}
                onRegisterClick={handleRegisterResidenceCard}
              />
            </Suspense>
          </LazyBottomSheet>
        </Suspense>
      ) : null}
    </>
  )
}
