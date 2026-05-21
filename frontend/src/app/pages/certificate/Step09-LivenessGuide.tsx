import { useNavigate } from "react-router-dom";
import { Camera, Lightbulb, ScanFace } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";

export function LivenessGuide() {
  const navigate = useNavigate();

  return (
    <MobileLayout
      title="비대면 실명확인"
      bottomContent={<Btn_1Col onClick={() => navigate("/certificate/step-10")}>동의하고 촬영하기</Btn_1Col>}
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
          <div className="rounded-2xl border-2 border-dashed border-blue-200 min-h-[300px] flex flex-col items-center justify-center gap-4 px-6">
            <div className="w-24 h-1 rounded-full bg-blue-300/70" />
            <div className="w-40 h-40 rounded-full border-2 border-blue-300 flex items-center justify-center">
              <ScanFace className="w-16 h-16 text-blue-400" />
            </div>
            <p className="text-sm text-muted-foreground">얼굴 촬영 가이드 영역</p>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
              <ScanFace className="w-4 h-4" />
            </div>
            <p className="text-sm leading-relaxed">얼굴을 영역 안에 맞추고 정면을 바라봐 주세요.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <p className="text-sm leading-relaxed">너무 밝거나 어둡지 않은 곳에서 진행해 주세요.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <p className="text-sm leading-relaxed">휴대폰 전면 카메라를 깨끗이 닦고 얼굴 높이까지 들어주세요.</p>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}
