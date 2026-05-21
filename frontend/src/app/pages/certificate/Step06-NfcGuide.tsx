import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";

export function NfcGuide() {
  const navigate = useNavigate();

  return (
    <MobileLayout
      title="비대면 실명확인"
      backPath="/certificate/step-05"
      bottomContent={<Btn_1Col onClick={() => navigate("/certificate/step-07")}>NFC 태깅 시작</Btn_1Col>}
    >
      <div className="space-y-4 pb-2">
        <section className="space-y-1">
          <h2 className="text-2xl font-semibold leading-tight">여권 NFC 태깅을 수행해 주세요</h2>
          <p className="text-sm text-muted-foreground">전자여권(e-Passport) 대상</p>
        </section>

        <section className="rounded-2xl bg-secondary p-6">
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-border bg-background min-h-[280px] flex items-center justify-center text-center px-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                이미지 자리 영역
                <br />
                권장 규격: 280 x 220 (px)
                <br />
                비율: 14 : 11
              </p>
            </div>
            <p className="text-sm text-center text-foreground/90">
              휴대폰 뒷면을 여권 칩에 가까이 대주세요
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-secondary p-4">
          <ul className="text-sm text-foreground/90 space-y-2 list-disc pl-5">
            <li>NFC 기능이 켜져 있는지 확인해 주세요.</li>
            <li>여권을 움직이지 않고 가만히 대주세요.</li>
          </ul>
        </section>
      </div>
    </MobileLayout>
  );
}
