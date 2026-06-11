import { useNavigate } from "react-router-dom";
import { Camera, Lightbulb, ScanFace } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { useTranslation } from "../../i18n";

const guideItems = [
  { key: "account.livenessGuide.item1", icon: ScanFace },
  { key: "account.livenessGuide.item2", icon: Lightbulb },
  { key: "account.livenessGuide.item3", icon: Camera },
] as const;

export function LivenessGuide() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <MobileLayout
      title={t("account.identityTitle", "비대면 실명확인")}
      titleKey="account.identityTitle"
      backPath="/account/step-05"
      bottomContent={
        <Btn_1Col onClick={() => navigate("/account/step-07")}>
          {t("account.livenessGuide.agreeAndCapture", "동의하고 촬영하기")}
        </Btn_1Col>
      }
    >
      <div className="space-y-5 pb-2">
        <section className="space-y-1">
          <h2 className="text-2xl font-semibold leading-tight">
            {t("account.livenessGuide.heading", "본인 확인을 위해\n얼굴을 촬영해 주세요")
              .split("\n")
              .map((line, index, lines) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < lines.length - 1 && <br />}
                </span>
              ))}
          </h2>
        </section>

        <section className="rounded-2xl bg-secondary p-5">
          <div className="min-h-[300px] rounded-2xl border-2 border-dashed border-blue-200 px-6 flex flex-col items-center justify-center gap-4">
            <div className="h-1 w-24 rounded-full bg-blue-300/70" />
            <div className="h-40 w-40 rounded-full border-2 border-blue-300 flex items-center justify-center">
              <ScanFace className="h-16 w-16 text-blue-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("account.livenessGuide.guideArea", "얼굴 촬영 가이드 영역")}
            </p>
          </div>
        </section>

        <section className="space-y-3">
          {guideItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-start gap-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-blue-50 text-primary flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm leading-relaxed">{t(item.key)}</p>
              </div>
            );
          })}
        </section>
      </div>
    </MobileLayout>
  );
}
