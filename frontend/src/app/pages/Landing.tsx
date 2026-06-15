import { useNavigate } from "react-router-dom";
import { Btn_1Col } from "../components/design-system/Btn_1Col";
import { AppButton } from "../components/design-system/AppButton";
import { MobileLayout } from "../components/layout/MobileLayout";
import landingIllustrationSrc from "./main/assets/header-brand-wordmark.webp";
import { useTranslation } from "../i18n";

export function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="h-full bg-background w-full relative">
      <div className="absolute top-4 right-5 z-50">
        <AppButton
          variant="unstyled"
          onClick={() => navigate("/language")}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("language.title")}
        </AppButton>
      </div>

      <MobileLayout
        title=""
        headerType="none"
        bottomContent={
          <Btn_1Col onClick={() => navigate("/language")}>
            {t("landing.start")}
          </Btn_1Col>
        }
      >
        <div className="flex min-h-full flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <img
              src={landingIllustrationSrc}
              alt="NOVA"
              className="h-auto w-[250px] object-contain"
            />
            <h2 className="mt-4 text-center text-sm text-muted-foreground">
              {t("landing.subtitle")}
            </h2>
          </div>
        </div>
      </MobileLayout>
    </div>
  );
}
