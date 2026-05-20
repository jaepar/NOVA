import { useNavigate } from "react-router-dom";
import { Camera, CheckCircle2, CircleAlert } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";

const guideItems = [
  "여권 사진면(개인정보 페이지)을 펼친 상태로 준비해 주세요.",
  "밝은 곳에서 그림자 없이 촬영해 주세요.",
  "여권의 네 모서리가 화면 안에 모두 보이게 맞춰 주세요.",
  "흔들림 없이 글자가 선명하게 보이도록 촬영해 주세요.",
];

export function PassportCaptureGuide() {
  const navigate = useNavigate();

  return (
    <MobileLayout
      title="비대면 실명확인"
      bottomContent={<Btn_1Col onClick={() => navigate("/success")}>여권 촬영 시작하기</Btn_1Col>}
    >
      <div className="space-y-5 pb-2">
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold leading-tight">
            여권 촬영 전
            <br />
            아래 내용을 확인해 주세요
          </h2>
          <p className="text-sm text-muted-foreground">정확한 인증을 위해 촬영 가이드를 먼저 확인해 주세요.</p>
        </section>

        <section className="rounded-2xl bg-secondary p-5 space-y-4">
          <div className="w-14 h-14 rounded-full bg-background border border-border flex items-center justify-center text-primary">
            <Camera className="w-7 h-7" />
          </div>
          <div className="space-y-3">
            {guideItems.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-secondary p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <CircleAlert className="w-5 h-5" />
            <p className="font-medium">주의사항</p>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            반사광, 접힘, 손가락 가림이 있는 경우 인증이 실패할 수 있습니다. 실패 시 안내에 따라 다시 촬영해 주세요.
          </p>
        </section>
      </div>
    </MobileLayout>
  );
}
