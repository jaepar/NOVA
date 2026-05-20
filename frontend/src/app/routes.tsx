import { createBrowserRouter } from "react-router-dom";
import { Home } from "./pages/Home";
import { Language } from "./pages/Language";
import { Landing } from "./pages/Landing";
import { Main } from "./pages/Main";
import { Login } from "./pages/Login";
import { Transfer } from "./pages/Transfer";
import { Exchange } from "./pages/Exchange";
import { MyPage } from "./pages/MyPage";
import { Step1 } from "./pages/Step1";
import { Step2 } from "./pages/Step2";
import { Step3 } from "./pages/Step3";
import { TransactionHistory } from "./pages/TransactionHistory";
import { DesignSystem } from "./pages/DesignSystem";
import { Success } from "./pages/common/Success";
import { Failed } from "./pages/common/Failed";
import { Loading } from "./pages/common/Loading";
import { NotFound } from "./pages/common/NotFound";
import { OneButtonTemplate } from "./pages/common/OneButtonTemplate";
import { TwoButtonTemplate } from "./pages/common/TwoButtonTemplate";
import { CloseButtonTemplate } from "./pages/common/CloseButtonTemplate";
import { ConsentTemplate } from "./pages/common/ConsentTemplate";
import { ConsentDetailTemplate } from "./pages/common/ConsentDetailTemplate";
import { ConsentCategoryCarouselTemplate } from "./pages/common/ConsentCategoryCarouselTemplate";
import { Notifications } from "./pages/Notifications";
import { WalletCharge, WalletHome, WalletPayment, WalletTerms } from "./pages/wallet";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/home",
    Component: Home,
  },
  {
    path: "/language",
    Component: Language,
  },
  {
    path: "/landing",
    Component: Landing,
  },
  {
    path: "/main",
    Component: Main,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/transfer",
    Component: Transfer,
  },
  {
    path: "/exchange",
    Component: Exchange,
  },
  {
    path: "/mypage",
    Component: MyPage,
  },
  {
    path: "/notifications",
    Component: Notifications,
  },
  {
    path: "/wallet",
    Component: WalletTerms,
  },
  {
    path: "/wallet/terms",
    Component: WalletTerms,
  },
  {
    path: "/wallet/home",
    Component: WalletHome,
  },
  {
    path: "/wallet/charge",
    Component: WalletCharge,
  },
  {
    path: "/wallet/payment",
    Component: WalletPayment,
  },
  {
    path: "/step-1",
    Component: Step1,
  },
  {
    path: "/step-2",
    Component: Step2,
  },
  {
    path: "/step-3",
    Component: Step3,
  },
  {
    path: "/consent-template",
    Component: ConsentTemplate,
  },
  {
    path: "/consent-template/terms/:termId",
    Component: ConsentDetailTemplate,
  },
  {
    path: "/consent-template/categories/:categoryId/consent",
    Component: ConsentCategoryCarouselTemplate,
  },
  {
    path: "/transaction-history",
    Component: TransactionHistory,
  },
  {
    path: "/design-system",
    Component: DesignSystem,
  },
  {
    path: "/loading",
    element: (
      <Loading
        headerTitle="Template"
        title="Task"
        description="description(optional)"
        spinnerSize="lg"
      />
    ),
  },
  {
    path: "/failed",
    element: (
      <Failed
        headerTitle="Template"
        title="Task"
        description="description(optional)"
        buttonText="돌아가기"
        redirectPath="/"
      />
    ),
  },
  {
    path: "/success",
    element: (
      <Success
        headerTitle="Template"
        title="Task"
        description="description(optional)"
        buttonText="확인"
        redirectPath="/main"
      />
    ),
  },
  {
    path: "/one-button-template",
    element: (
      <OneButtonTemplate
        headerTitle="Template"
        buttonText="확인"
        redirectPath="/"
      >
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <h2 className="text-xl">1열 버튼 템플릿</h2>
          <p className="text-muted-foreground text-center">
            이 페이지는 재사용 가능한 템플릿입니다.<br />
            원하는 컨텐츠를 children으로 전달하세요.
          </p>
        </div>
      </OneButtonTemplate>
    ),
  },
  {
    path: "/two-button-template",
    element: (
      <TwoButtonTemplate
        headerTitle="Template"
        leftButtonText="취소"
        rightButtonText="다음"
        leftRedirectPath="/"
        rightRedirectPath="/main"
      >
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <h2 className="text-xl">2열 버튼 템플릿</h2>
          <p className="text-muted-foreground text-center">
            이 페이지는 재사용 가능한 템플릿입니다.<br />
            좌측 버튼: 취소, 이전, 재촬영 등<br />
            우측 버튼: 다음, 확인, 완료 등
          </p>
        </div>
      </TwoButtonTemplate>
    ),
  },
  {
    path: "/close-button-template",
    element: (
      <CloseButtonTemplate
        headerTitle="Template"
        closePath="/"
      >
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <h2 className="text-xl">닫기 버튼 템플릿</h2>
          <p className="text-muted-foreground text-center">
            이 페이지는 재사용 가능한 템플릿입니다.<br />
            우측 상단 X 버튼으로 닫을 수 있습니다.<br />
            뒤로가기 버튼은 표시되지 않습니다.
          </p>
        </div>
      </CloseButtonTemplate>
    ),
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
