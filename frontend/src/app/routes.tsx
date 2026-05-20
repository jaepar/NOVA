import { createBrowserRouter } from "react-router-dom";
import { Home } from "./pages/Home";
import { Language } from "./pages/Language";
import { Landing } from "./pages/Landing";
import { Main } from "./pages/Main";
import { Login } from "./pages/Login";
import { Transfer } from "./pages/Transfer";
import { Exchange } from "./pages/Exchange";
import { MyPage } from "./pages/MyPage";
import { Step1 } from "./pages/certificate/Step01-TermsAgreement";
import { Step1TermDetail } from "./pages/certificate/Step01-TermDetail";
import { AllTermsAgreements } from "./pages/certificate/Step01-AllTermsAgreements";
import { Step2 } from "./pages/certificate/Step02-VerificationFlow";
import { Step3 } from "./pages/certificate/Step03-DocumentUpload";
import { PassportCaptureGuide } from "./pages/certificate/Step04-PassportCaptureGuide";
import { PassportCameraCapture } from "./pages/certificate/Step05-PassportCameraCapture";
import { NfcGuide } from "./pages/certificate/Step06-NfcGuide";
import { NfcOcrLoading } from "./pages/certificate/Step07-NfcOcrLoading";
import { NfcCompareFailed } from "./pages/certificate/Step08-NfcCompareFailed";
import { LivenessGuide } from "./pages/certificate/Step09-LivenessGuide";
import { LivenessTermsAgreement } from "./pages/certificate/Step10-LivenessTermsAgreement";
import { Step10TermDetail } from "./pages/certificate/Step10-TermDetail";
import { LivenessCameraCapture } from "./pages/certificate/Step11-LivenessCameraCapture";
import { VerificationCompleted } from "./pages/certificate/Step12-VerificationCompleted";
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
    path: "/certificate/step-01",
    Component: Step1,
  },
  {
    path: "/certificate/step-01/terms/:termId",
    Component: Step1TermDetail,
  },
  {
    path: "/certificate/step-01/categories/:categoryId/consent",
    Component: AllTermsAgreements,
  },
  {
    path: "/certificate/step-02",
    Component: Step2,
  },
  {
    path: "/certificate/step-03",
    Component: Step3,
  },
  {
    path: "/certificate/step-04",
    Component: PassportCaptureGuide,
  },
  {
    path: "/certificate/step-05",
    Component: PassportCameraCapture,
  },
  {
    path: "/certificate/step-06",
    Component: NfcGuide,
  },
  {
    path: "/certificate/step-07",
    Component: NfcOcrLoading,
  },
  {
    path: "/certificate/step-08",
    Component: NfcCompareFailed,
  },
  {
    path: "/certificate/step-09",
    Component: LivenessGuide,
  },
  {
    path: "/certificate/step-10",
    Component: LivenessTermsAgreement,
  },
  {
    path: "/certificate/step-10/terms/:termId",
    Component: Step10TermDetail,
  },
  {
    path: "/certificate/step-11",
    Component: LivenessCameraCapture,
  },
  {
    path: "/certificate/step-12",
    Component: VerificationCompleted,
  },
  {
    path: "/certificate/step-13",
    element: (
      <Success
        headerTitle="비대면 실명확인"
        title="인증서 발급 신청이 완료 되었어요"
        description={"인증서 발급까지는 평균 3시간~5시간이 소요됩니다.\n발급이 완료되면 알림으로 안내해 드릴게요."}
        buttonText="확인"
        redirectPath="/main"
      />
    ),
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
