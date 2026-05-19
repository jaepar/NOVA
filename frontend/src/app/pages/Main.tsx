import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Headphones,
  MessageSquare,
  CreditCard,
  Wallet,
  ChevronRight,
  ArrowRightLeft,
  MoreVertical,
  Bell,
} from "lucide-react";
import { BottomNav } from "../components/layout/BottomNav";
import { SideMenu } from "../components/layout/SideMenu";
import { AppButton } from "../components/design-system/AppButton";
import { Btn_1Col } from "../components/design-system/Btn_1Col";
import { Btn_2Col } from "../components/design-system/Btn_2Col";
import { MobileLayout } from "../components/layout/MobileLayout";
import { BottomSheet } from "../components/layout/BottomSheet";

export function Main() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCertificateSheetOpen, setIsCertificateSheetOpen] = useState(false);

  // TODO: 실제 구현 시 상태 관리 시스템으로 교체
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true); // TODO: API 연결 시 실제 데이터로 교체

  const handleLogout = () => {
    setIsLoggedIn(false);
    setHasAccount(false);
    setHasCertificate(false);
  };

  const handleOpenAccount = () => {
    if (isLoggedIn && !hasAccount && !hasCertificate) {
      setIsCertificateSheetOpen(true);
      return;
    }
    setHasAccount(true);
  };

  const services = [
    {
      icon: <Headphones className="w-8 h-8" />,
      label: "화상상담",
      color: "text-blue-500",
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      label: "병원예약",
      color: "text-blue-500",
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      label: "외국인등록증",
      color: "text-blue-500",
    },
    {
      icon: <Wallet className="w-8 h-8" />,
      label: "월렛",
      color: "text-blue-500",
    },
  ];

  const exchangeRates = [
    {
      currency: "USD",
      name: "미국 달러",
      rate: "1,340.50",
      change: "+2.3%",
      isPositive: true,
    },
    {
      currency: "JPY",
      name: "일본 엔",
      rate: "9.82",
      change: "-0.5%",
      isPositive: false,
    },
    {
      currency: "EUR",
      name: "유로",
      rate: "1,456.20",
      change: "+1.8%",
      isPositive: true,
    },
  ];

  return (
    <div className="h-full bg-background w-full">
      <MobileLayout
        title=""
        showBackButton={false}
        headerLeftContent={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
            <span className="text-lg text-blue-600">NOVA</span>
          </div>
        }
        headerRightContent={
          <div className="flex items-center gap-2">
            <AppButton
              variant="unstyled"
              onClick={() => navigate('/notifications')}
              className="p-2 hover:bg-secondary rounded-lg transition-colors relative"
            >
              <Bell className="w-6 h-6" />
              {hasUnreadNotifications && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </AppButton>
            <AppButton
              variant="unstyled"
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </AppButton>
          </div>
        }
      >
        <div className="space-y-3">
        {/* Action Buttons / Account Card */}
        <section>
          {!isLoggedIn ? (
            // 상태 1: 로그인 안 됨
            <div className="bg-secondary rounded-2xl p-6 h-[180px] flex flex-col justify-evenly">
              <div>
                
              </div>
              <div className="space-y-3">
                <Btn_1Col onClick={() => setIsLoggedIn(true)}>
                  로그인
                </Btn_1Col>
                <Btn_1Col variant="outline" onClick={() => navigate("/signup")}>
                  회원가입
                </Btn_1Col>
              </div>
            </div>
          ) : !hasAccount ? (
            // 상태 2: 로그인 됨 + 계좌 없음
            <div className="bg-secondary rounded-2xl p-6 h-[180px] flex flex-col justify-evenly">
              <div className="space-y-2">
                <h3 className="font-semibold text-[16px]">계좌 개설로 다양한 서비스를 이용하세요</h3>
                <p className="text-sm text-muted-foreground">새로운 시작 NOVA</p>
              </div>
              <Btn_1Col onClick={handleOpenAccount}>
                계좌 개설하기
              </Btn_1Col>
            </div>
          ) : (
            // 상태 3: 로그인 됨 + 계좌 있음
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white relative h-[180px] flex flex-col justify-evenly">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white"></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">우리 SUPER주거래 통장</span>
                    </div>
                    <p className="text-xs text-white/80 mt-0.5">
                      우리 1002-959-126226
                    </p>
                  </div>
                </div>
                <AppButton variant="unstyled" className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </AppButton>
              </div>

              {/* Balance */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-white/80 mb-1">한도제한</p>
                  <p className="text-2xl font-semibold">1,234,567 원</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Info Card */}
        <section>
          <div className="rounded-2xl overflow-hidden">
            <div className="bg-blue-600 p-6 h-40 flex flex-col justify-between relative">
              <div>
                <h3 className="text-white text-lg font-medium mb-2">
                  구인구직 정보
                </h3>
                <p className="text-white/90 text-sm whitespace-pre-line">
                  글로벌 인재와 일자리를 만나보세요!
                </p>
              </div>
              {/* Simple decorative elements */}
              <div className="absolute right-6 bottom-6 flex gap-2">
                <div className="w-12 h-12 rounded-full bg-white/20"></div>
                <div className="w-12 h-12 rounded-full bg-white/20"></div>
                <div className="w-12 h-12 rounded-full bg-white/20"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="space-y-4">
          <h3>생활</h3>
          <div className="grid grid-cols-4 max-[389px]:grid-cols-1 gap-4">
            {services.map((service, index) => (
              <AppButton
                variant="unstyled"
                key={index}
                className="flex flex-col items-center gap-2 hover:bg-secondary rounded-xl transition-colors max-[389px]:bg-secondary max-[389px]:p-4"
              >
                <div className={service.color}>
                  {service.icon}
                </div>
                <span className="text-center w-full text-[12px]">
                  {service.label}
                </span>
              </AppButton>
            ))}
          </div>
        </section>

        {/* Exchange Rate Section */}
        <section className="space-y-4">
          <h3>환율 정보</h3>
          <div className="grid grid-cols-3 max-[389px]:grid-cols-1 gap-3">
            {exchangeRates.map((rate, index) => (
              <div
                key={index}
                className="bg-secondary p-4 rounded-2xl space-y-2"
              >
                <div className="font-medium text-sm">{rate.currency}</div>
                <div className="text-lg font-semibold">{rate.rate}</div>
                <div className={`text-xs ${rate.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {rate.change}
                </div>
              </div>
            ))}
          </div>
        </section>
        </div>
      </MobileLayout>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Side Menu */}
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onLogin={() => setIsLoggedIn(true)}
      />

      <BottomSheet
        isOpen={isCertificateSheetOpen}
        onClose={() => setIsCertificateSheetOpen(false)}
        title=""
      >
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
            rightLabel="발급하기"
            onLeftClick={() => setIsCertificateSheetOpen(false)}
            onRightClick={() => {
              setIsCertificateSheetOpen(false);
              navigate("/step-1");
            }}
          />
        </div>
      </BottomSheet>
    </div>
  );
}
