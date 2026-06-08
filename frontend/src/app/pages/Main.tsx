import { useNavigate } from 'react-router-dom'
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
import hospitalReservationIcon from './main/assets/hospital-reservation-icon.png'
import registrationCardIcon from './main/assets/registration-card-icon.png'
import walletIcon from './main/assets/wallet-icon.png'
import type { ExchangeRateItem, ServiceItem } from './main/types'

export function Main() {
  const navigate = useNavigate();
  const isMenuOpen = useMainPageStore((state) => state.isMenuOpen);
  const isLoggedIn = useMainPageStore((state) => state.isLoggedIn);
  const hasAccount = useMainPageStore((state) => state.hasAccount);
  const hasUnreadNotifications = useMainPageStore(
    (state) => state.hasUnreadNotifications
  );
  const isCertificateSheetOpen = useMainPageStore(
    (state) => state.isCertificateSheetOpen
  );
  const setMenuOpen = useMainPageStore((state) => state.setMenuOpen);
  const setCertificateSheetOpen = useMainPageStore(
    (state) => state.setCertificateSheetOpen
  );
  const logout = useMainPageStore((state) => state.logout);

  const services: ServiceItem[] = [
    {
      icon: <img src={hospitalReservationIcon} alt="" className="h-9 w-9 object-contain" />,
      label: "병원예약",
    },
    {
      icon: <img src={registrationCardIcon} alt="" className="h-9 w-9 object-contain" />,
      label: "외국인등록증",
    },
    {
      icon: <img src={walletIcon} alt="" className="h-9 w-9 rounded-lg object-cover" />,
      label: "월렛",
      path: "/wallet",
    },
  ];

  const exchangeRates: ExchangeRateItem[] = [
    { currency: "USD", rate: "1,340.50", change: "+2.3%", isPositive: true },
    { currency: "JPY", rate: "9.82", change: "-0.5%", isPositive: false },
    { currency: "EUR", rate: "1,456.20", change: "+1.8%", isPositive: true },
  ];

  const handleServiceClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  const handleIssueCertificate = () => {
    setCertificateSheetOpen(false);
    navigate("/certificate/step-01");
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

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
            onNotificationsClick={() => navigate("/notifications")}
            onMenuClick={() => setMenuOpen(true)}
          />
        }
      >
        <div className="space-y-4 pt-3">
          <section>
            <MainAccountPanel
              isLoggedIn={isLoggedIn}
              hasAccount={hasAccount}
              onLoginClick={() => navigate("/login")}
              onSignupClick={() => navigate("/signup")}
              onOpenCertificateSheet={() => setCertificateSheetOpen(true)}
            />
          </section>

          <section>
            <MainJobBanner onClick={() => navigate('/jobs')} />
          </section>

          <MainServiceGrid
            services={services}
            onServiceClick={handleServiceClick}
          />

          <MainExchangeRateGrid exchangeRates={exchangeRates} />
        </div>
      </MobileLayout>

      <BottomNav />

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setMenuOpen(false)}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onLogin={() => navigate("/login")}
        onProfile={() => navigate('/mypage')}
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
  );
}
