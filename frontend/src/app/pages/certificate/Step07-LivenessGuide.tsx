import { useNavigate } from "react-router-dom";
import { Camera, Lightbulb, ScanFace } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";

export function LivenessGuide() {
  const navigate = useNavigate();

  return (
    <MobileLayout
      title="비대면 실명확인"
      backPath="/certificate/step-06"
      bottomContent={
        <Btn_1Col onClick={() => navigate("/certificate/step-08")}>
          동의하고 촬영하기
        </Btn_1Col>
      }
    >
      <div className="space-y-5 pb-2">
        <section className="space-y-1">
          <h2 className="text-2xl font-semibold leading-tight">
            본인 확인을 위해
            <br />
            얼굴을 촬영해 주세요
          </h2>
        </section>

        <section className="rounded-2xl bg-secondary p-5">
          <div className="min-h-[300px] rounded-2xl border-2 border-dashed border-primary-light/30 px-6 flex flex-col items-center justify-center gap-4">
            <div className="h-1 w-24 rounded-full bg-primary-light/70" />
            <div className="h-40 w-40 rounded-full border-2 border-primary-light/60 flex items-center justify-center">
              <ScanFace className="h-16 w-16 text-primary-light" />
            </div>
            <p className="text-sm text-muted-foreground">
              얼굴 촬영 가이드 영역
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 shrink-0 rounded-full bg-primary-soft text-primary flex items-center justify-center">
              <ScanFace className="h-4 w-4" />
            </div>
            <p className="text-sm leading-relaxed">
              얼굴을 안내 영역에 맞추고 정면을 바라봐 주세요.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 shrink-0 rounded-full bg-primary-soft text-primary flex items-center justify-center">
              <Lightbulb className="h-4 w-4" />
            </div>
            <p className="text-sm leading-relaxed">
              너무 밝거나 어둡지 않은 곳에서 진행해 주세요.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 shrink-0 rounded-full bg-primary-soft text-primary flex items-center justify-center">
              <Camera className="h-4 w-4" />
            </div>
            <p className="text-sm leading-relaxed">
              모바일 화면 카메라를 켠 상태에서 얼굴 가까이로 이동해 주세요.
            </p>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}
