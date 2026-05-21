import { useNavigate } from "react-router-dom";
import {
  Bell,
  CreditCard,
  Headphones,
  Menu,
  MessageSquare,
  MoreVertical,
  Wallet,
} from "lucide-react";
import { MobileLayout } from "../components/layout/MobileLayout";
import { BottomNav } from "../components/layout/BottomNav";
import { SideMenu } from "../components/layout/SideMenu";
import { BottomSheet } from "../components/layout/BottomSheet";
import { AppButton } from "../components/design-system/AppButton";
import { Btn_1Col } from "../components/design-system/Btn_1Col";
import { Btn_2Col } from "../components/design-system/Btn_2Col";
import { useMainPageStore } from "../stores/pageStores";

export function Main() {
  const navigate = useNavigate();
  const isMenuOpen = useMainPageStore((state) => state.isMenuOpen);
  const isLoggedIn = useMainPageStore((state) => state.isLoggedIn);
  const hasAccount = useMainPageStore((state) => state.hasAccount);
  const hasUnreadNotifications = useMainPageStore((state) => state.hasUnreadNotifications);
  const isCertificateSheetOpen = useMainPageStore((state) => state.isCertificateSheetOpen);
  const setMenuOpen = useMainPageStore((state) => state.setMenuOpen);
  const setLoggedIn = useMainPageStore((state) => state.setLoggedIn);
  const setCertificateSheetOpen = useMainPageStore((state) => state.setCertificateSheetOpen);
  const logout = useMainPageStore((state) => state.logout);

  const services: Array<{ icon: React.ReactNode; label: string; path?: string }> = [
    { icon: <Headphones className="w-8 h-8" />, label: "화상상담" },
    { icon: <MessageSquare className="w-8 h-8" />, label: "병원예약" },
    { icon: <CreditCard className="w-8 h-8" />, label: "외국인등록증" },
    { icon: <Wallet className="w-8 h-8" />, label: "월렛", path: "/wallet" },
  ];

  const exchangeRates = [
    { currency: "USD", rate: "1,340.50", change: "+2.3%", isPositive: true },
    { currency: "JPY", rate: "9.82", change: "-0.5%", isPositive: false },
    { currency: "EUR", rate: "1,456.20", change: "+1.8%", isPositive: true },
  ];

  return (
    <div className="h-full w-full bg-background">
      <MobileLayout
        title=""
        headerType="back"
        showBackButton={false}
        headerLeftContent={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
            <span className="text-lg text-blue-600">NOVA</span>
          </div>
        }
        headerRightContent={
          <div className="flex items-center gap-2">
            <AppButton
              variant="unstyled"
              onClick={() => navigate("/notifications")}
              className="p-2 hover:bg-secondary rounded-lg transition-colors relative"
            >
              <Bell className="w-6 h-6" />
              {hasUnreadNotifications && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </AppButton>
            <AppButton
              variant="unstyled"
              onClick={() => setMenuOpen(true)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </AppButton>
          </div>
        }
      >
        <div className="space-y-4">
          <section>
            {!isLoggedIn ? (
              <div className="bg-secondary rounded-2xl p-6 min-h-[180px] flex flex-col justify-center">
                <div className="space-y-3">
                  <Btn_1Col onClick={() => setLoggedIn(true)}>로그인</Btn_1Col>
                  <Btn_1Col variant="outline" onClick={() => navigate("/signup")}>
                    회원가입
                  </Btn_1Col>
                </div>
              </div>
            ) : !hasAccount ? (
              <div className="bg-secondary rounded-2xl p-6 min-h-[180px] flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold text-base">계좌 개설로 더 다양한 서비스를 이용하세요</h3>
                  <p className="text-sm text-muted-foreground">간편한 계좌 개설로 글로벌 금융 서비스를 시작해 보세요.</p>
                </div>
                <Btn_1Col onClick={() => setCertificateSheetOpen(true)}>계좌 개설하기</Btn_1Col>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white min-h-[180px] flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-white" />
                    </div>
                    <div>
                      <span className="font-medium">우리 SUPER 주거래 통장</span>
                      <p className="text-xs text-white/80 mt-0.5">우리 1002-959-126226</p>
                    </div>
                  </div>
                  <AppButton variant="unstyled" className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </AppButton>
                </div>

                <div>
                  <p className="text-sm text-white/80 mb-1">잔액</p>
                  <p className="text-2xl font-semibold">1,234,567 원</p>
                </div>
              </div>
            )}
          </section>

          <section>
            <div className="rounded-2xl overflow-hidden">
              <div className="bg-blue-600 p-6 h-40 flex flex-col justify-between relative">
                <div>
                  <h3 className="text-white text-lg font-medium mb-2">구인구직 정보</h3>
                  <p className="text-white/90 text-sm">글로벌 인재와 함께 더 나은 내일을 만들어보세요!</p>
                </div>
                <div className="absolute right-6 bottom-6 flex gap-2">
                  <div className="w-12 h-12 rounded-full bg-white/20" />
                  <div className="w-12 h-12 rounded-full bg-white/20" />
                  <div className="w-12 h-12 rounded-full bg-white/20" />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3>생활</h3>
            <div className="grid grid-cols-4 max-[389px]:grid-cols-1 gap-4">
              {services.map((service) => (
                <AppButton
                  variant="unstyled"
                  key={service.label}
                  onClick={() => {
                    if (service.path) navigate(service.path);
                  }}
                  className="flex flex-col items-center gap-2 hover:bg-secondary rounded-xl transition-colors max-[389px]:bg-secondary max-[389px]:p-4"
                >
                  <div className="text-blue-500">{service.icon}</div>
                  <span className="text-center w-full text-xs">{service.label}</span>
                </AppButton>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3>환율 정보</h3>
            <div className="grid grid-cols-3 max-[389px]:grid-cols-1 gap-3">
              {exchangeRates.map((rate) => (
                <div key={rate.currency} className="bg-secondary p-4 rounded-2xl space-y-2">
                  <div className="font-medium text-sm">{rate.currency}</div>
                  <div className="text-lg font-semibold">{rate.rate}</div>
                  <div className={`text-xs ${rate.isPositive ? "text-green-600" : "text-red-600"}`}>{rate.change}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </MobileLayout>

      <BottomNav />

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setMenuOpen(false)}
        isLoggedIn={isLoggedIn}
        onLogout={logout}
        onLogin={() => setLoggedIn(true)}
      />

      <BottomSheet isOpen={isCertificateSheetOpen} onClose={() => setCertificateSheetOpen(false)} title="">
        <div className="space-y-8 pb-2">
          <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold leading-snug">
              금융 서비스 이용을 위해
              <br />
              인증서 발급이 필요해요
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              안전한 금융 거래를 위해
              <br />
              신원 인증 후 인증서를 발급받아야
              <br />
              계좌 개설 및 금융 서비스를
              <br />
              이용하실 수 있어요.
            </p>
          </div>

          <Btn_2Col
            leftLabel="나중에 하기"
            rightLabel="신원 인증 시작하기"
            onLeftClick={() => setCertificateSheetOpen(false)}
            onRightClick={() => {
              setCertificateSheetOpen(false);
              navigate("/certificate/step-01");
            }}
          />
        </div>
      </BottomSheet>
    </div>
  );
}
