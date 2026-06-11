import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, MessageSquare, Wallet } from "lucide-react";
import { MobileLayout } from "../components/layout/MobileLayout";
import { BottomNav } from "../components/layout/BottomNav";
import { SideMenu } from "../components/layout/SideMenu";
import { BottomSheet } from "../components/layout/BottomSheet";
import { novaToast } from "../components/design-system/toast";
import { useMainPageStore } from "../stores/pageStores";
import {
  authApi,
  bankingApi,
  hospitalChatApi,
  userApi,
  type AccountHomeResponse,
  type NotificationResponse,
} from "../../api";
import { MainHeaderBrand } from "./main/MainHeaderBrand";
import { MainHeaderActions } from "./main/MainHeaderActions";
import { MainAccountPanel } from "./main/MainAccountPanel";
import { MainJobBanner } from "./main/MainJobBanner";
import { MainServiceGrid } from "./main/MainServiceGrid";
import { MainExchangeRateGrid } from "./main/MainExchangeRateGrid";
import { MainCertificateSheetContent } from "./main/MainCertificateSheetContent";
import type { ExchangeRateItem, ServiceItem } from "./main/types";

export function Main() {
  const navigate = useNavigate();
  const isMenuOpen = useMainPageStore((state) => state.isMenuOpen);
  const isLoggedIn = useMainPageStore((state) => state.isLoggedIn);
  const hasUnreadNotifications = useMainPageStore(
    (state) => state.hasUnreadNotifications
  );
  const isCertificateSheetOpen = useMainPageStore(
    (state) => state.isCertificateSheetOpen
  );
  const setMenuOpen = useMainPageStore((state) => state.setMenuOpen);
  const setHasUnreadNotifications = useMainPageStore(
    (state) => state.setHasUnreadNotifications
  );
  const setCertificateSheetOpen = useMainPageStore(
    (state) => state.setCertificateSheetOpen
  );
  const logout = useMainPageStore((state) => state.logout);
  const [accountHome, setAccountHome] = useState<AccountHomeResponse | null>(
    null
  );
  const [isAccountHomeLoading, setAccountHomeLoading] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    []
  );
  const [isNotificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(false);
  const [isHospitalChatStarting, setHospitalChatStarting] = useState(false);

  const services: ServiceItem[] = [
    {
      id: "hospital-chat",
      icon: <MessageSquare className="w-8 h-8" />,
      label: isHospitalChatStarting ? "연결 중..." : "병원예약",
      disabled: isHospitalChatStarting,
    },
    {
      id: "foreigner-card",
      icon: <CreditCard className="w-8 h-8" />,
      label: "외국인등록증",
      path: "/foreigner-card/step-01",
    },
    {
      id: "wallet",
      icon: <Wallet className="w-8 h-8" />,
      label: "월렛",
      path: "/wallet",
    },
  ];

  const exchangeRates: ExchangeRateItem[] = [
    { currency: "USD", rate: "1,340.50", change: "+2.3%", isPositive: true },
    { currency: "JPY", rate: "9.82", change: "-0.5%", isPositive: false },
    { currency: "EUR", rate: "1,456.20", change: "+1.8%", isPositive: true },
  ];

  const handleServiceClick = async (service: ServiceItem) => {
    if (service.disabled) {
      return;
    }

    if (service.id === "hospital-chat") {
      setHospitalChatStarting(true);

      try {
        const session = await hospitalChatApi.startSession();
        navigate("/hospital-chat", {
          state: {
            conversationId: session.conversation_id,
            initialMessage: session.message,
          },
        });
      } catch {
        novaToast.error("잠시 후 다시 시도해 주세요.");
      } finally {
        setHospitalChatStarting(false);
      }

      return;
    }

    if (service.path) {
      navigate(service.path);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadAccountHome() {
      if (!isLoggedIn) {
        if (isMounted) {
          setAccountHome(null);
          setHasUnreadNotifications(false);
          setAccountHomeLoading(false);
        }
        return;
      }

      if (isMounted) {
        setAccountHomeLoading(true);
      }

      try {
        const nextAccountHome = await bankingApi.getHome();

        if (isMounted) {
          setAccountHome(nextAccountHome);
          setHasUnreadNotifications(nextAccountHome.hasNotification);
        }
      } catch {
        if (isMounted) {
          setAccountHome(null);
          setHasUnreadNotifications(false);
        }
      } finally {
        if (isMounted) {
          setAccountHomeLoading(false);
        }
      }
    }

    loadAccountHome();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  const loadNotifications = async () => {
    if (!isLoggedIn) {
      setNotifications([]);
      setNotificationsError(false);
      return;
    }

    setNotificationsLoading(true);
    setNotificationsError(false);

    try {
      const nextNotifications = await userApi.getNotifications();
      setNotifications(nextNotifications);
      setHasUnreadNotifications(nextNotifications.length > 0);
    } catch {
      setNotifications([]);
      setNotificationsError(true);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleNotificationsClick = () => {
    const willOpen = !isNotificationOpen;
    setNotificationOpen(willOpen);

    if (willOpen) {
      loadNotifications();
    }
  };

  const handleIssueCertificate = () => {
    setCertificateSheetOpen(false);
    navigate("/certificate/step-01");
  };

  const handleOpenAccount = () => {
    navigate("/account/step-01");
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      setAccountHome(null);
      setNotifications([]);
      setNotificationOpen(false);
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
            isLoggedIn={isLoggedIn}
            isNotificationOpen={isNotificationOpen}
            notifications={notifications}
            isNotificationsLoading={isNotificationsLoading}
            notificationsError={notificationsError}
            onNotificationsClick={handleNotificationsClick}
            onNotificationsClose={() => setNotificationOpen(false)}
            onMenuClick={() => {
              setNotificationOpen(false);
              setMenuOpen(true);
            }}
          />
        }
      >
        <div className="space-y-4">
          <section>
            <MainAccountPanel
              isLoggedIn={isLoggedIn}
              accountHome={accountHome}
              isLoading={isAccountHomeLoading}
              onLoginClick={() =>
                navigate("/login/form", {
                  state: { backPath: "/main", redirectTo: "/main" },
                })
              }
              onOpenCertificateSheet={() => setCertificateSheetOpen(true)}
              onOpenAccount={handleOpenAccount}
              onAccountPanelClick={() => navigate("/transaction-history")}
            />
          </section>

          <section>
            <MainJobBanner onClick={() => navigate("/jobs")} />
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
        onLogin={() =>
          navigate("/login/form", {
            state: { backPath: "/main", redirectTo: "/main" },
          })
        }
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
