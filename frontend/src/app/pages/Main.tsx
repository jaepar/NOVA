import { useNavigate } from 'react-router-dom'
import { CreditCard, Headphones, MessageSquare, Wallet } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { BottomNav } from '../components/layout/BottomNav'
import { SideMenu } from '../components/layout/SideMenu'
import { BottomSheet } from '../components/layout/BottomSheet'
import { useMainPageStore } from '../stores/pageStores'
import { authApi } from '../../api'
import { MainHeaderBrand } from './main/MainHeaderBrand'
import { MainHeaderActions } from './main/MainHeaderActions'
import { MainAccountPanel } from './main/MainAccountPanel'
import { MainJobBanner } from './main/MainJobBanner'
import { MainServiceGrid } from './main/MainServiceGrid'
import { MainExchangeRateGrid } from './main/MainExchangeRateGrid'
import { MainCertificateSheetContent } from './main/MainCertificateSheetContent'
import type { ExchangeRateItem, ServiceItem } from './main/types'

export function Main() {
  const navigate = useNavigate()
  const isMenuOpen = useMainPageStore((state) => state.isMenuOpen)
  const isLoggedIn = useMainPageStore((state) => state.isLoggedIn)
  const hasAccount = useMainPageStore((state) => state.hasAccount)
  const hasUnreadNotifications = useMainPageStore((state) => state.hasUnreadNotifications)
  const isCertificateSheetOpen = useMainPageStore((state) => state.isCertificateSheetOpen)
  const setMenuOpen = useMainPageStore((state) => state.setMenuOpen)
  const setLoggedIn = useMainPageStore((state) => state.setLoggedIn)
  const setCertificateSheetOpen = useMainPageStore((state) => state.setCertificateSheetOpen)
  const logout = useMainPageStore((state) => state.logout)

  const services: ServiceItem[] = [
    { icon: <Headphones className="w-8 h-8" />, label: '화상상담' },
    { icon: <MessageSquare className="w-8 h-8" />, label: '병원예약' },
    { icon: <CreditCard className="w-8 h-8" />, label: '외국인등록증' },
    { icon: <Wallet className="w-8 h-8" />, label: '월렛', path: '/wallet' },
  ]

  const exchangeRates: ExchangeRateItem[] = [
    { currency: 'USD', rate: '1,340.50', change: '+2.3%', isPositive: true },
    { currency: 'JPY', rate: '9.82', change: '-0.5%', isPositive: false },
    { currency: 'EUR', rate: '1,456.20', change: '+1.8%', isPositive: true },
  ]

  const handleServiceClick = (path?: string) => {
    if (path) {
      navigate(path)
    }
  }

  const handleIssueCertificate = () => {
    setCertificateSheetOpen(false)
    navigate('/certificate/step-01')
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
      logout()
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  return (
    <div className="h-full w-full bg-background">
      <MobileLayout
        title=""
        headerType="back"
        showBackButton={false}
        headerLeftContent={<MainHeaderBrand />}
        headerRightContent={
          <MainHeaderActions
            hasUnreadNotifications={hasUnreadNotifications}
            onNotificationsClick={() => navigate('/notifications')}
            onMenuClick={() => setMenuOpen(true)}
          />
        }
      >
        <div className="space-y-4">
          <section>
            <MainAccountPanel
              isLoggedIn={isLoggedIn}
              hasAccount={hasAccount}
              onLoginClick={() => setLoggedIn(true)}
              onSignupClick={() => navigate('/signup')}
              onOpenCertificateSheet={() => setCertificateSheetOpen(true)}
            />
          </section>

          <section>
            <MainJobBanner />
          </section>

          <MainServiceGrid services={services} onServiceClick={handleServiceClick} />

          <MainExchangeRateGrid exchangeRates={exchangeRates} />
        </div>
      </MobileLayout>

      <BottomNav />

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setMenuOpen(false)}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onLogin={() => setLoggedIn(true)}
      />

      <BottomSheet
        isOpen={isCertificateSheetOpen}
        onClose={() => setCertificateSheetOpen(false)}
        title=""
      >
        <MainCertificateSheetContent
          onLaterClick={() => setCertificateSheetOpen(false)}
          onIssueClick={handleIssueCertificate}
        />
      </BottomSheet>
    </div>
  )
}
