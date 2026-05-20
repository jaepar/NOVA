import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  CalendarClock,
  CalendarDays,
  Flag,
  Globe,
  IdCard,
  Landmark,
  ShieldCheck,
  User,
  WholeWord,
  X,
} from "lucide-react";
import { AppButton } from "../../components/design-system/AppButton";
import { Btn_2Col } from "../../components/design-system/Btn_2Col";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { useStep5PassportCaptureStore } from "../../stores/pageStores";

const ocrResultRows = [
  { label: "종류", value: "PM", icon: IdCard },
  { label: "국가코드", value: "KOR", icon: Globe },
  { label: "여권번호", value: "M592W1577", icon: IdCard },
  { label: "성", value: "PARK", icon: User },
  { label: "이름", value: "JAEHA", icon: WholeWord },
  { label: "생년월일", value: "2001.02.05", icon: Calendar },
  { label: "성별", value: "M", icon: User },
  { label: "국적", value: "REPUBLIC OF KOREA", icon: Flag },
  { label: "발행 관청", value: "MINISTRY OF FOREIGN AFFAIRS", icon: Landmark },
  { label: "발급일", value: "2023.08.14", icon: CalendarDays },
  { label: "기간만료일", value: "2033.08.14", icon: CalendarClock },
];

export function PassportCameraCapture() {
  const navigate = useNavigate();
  const mode = useStep5PassportCaptureStore((state) => state.mode);
  const cameraError = useStep5PassportCaptureStore((state) => state.cameraError);
  const setMode = useStep5PassportCaptureStore((state) => state.setMode);
  const setCapturedImage = useStep5PassportCaptureStore((state) => state.setCapturedImage);
  const setCameraError = useStep5PassportCaptureStore((state) => state.setCameraError);
  const reset = useStep5PassportCaptureStore((state) => state.reset);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [editableOcrValues, setEditableOcrValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(ocrResultRows.map((row) => [row.label, row.value])),
  );

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    reset();
    return () => {
      stopCamera();
      reset();
    };
  }, [reset]);

  useEffect(() => {
    const startCamera = async () => {
      if (mode !== "live") return;
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setCameraError("카메라를 사용할 수 없습니다. 권한을 확인해 주세요.");
      }
    };

    startCamera();

    if (mode === "review") {
      stopCamera();
    }
  }, [mode, setCameraError]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(imageDataUrl);
    setMode("review");
  };

  const handleOcrValueChange = (label: string, value: string) => {
    setEditableOcrValues((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  if (mode === "review") {
    return (
      <MobileLayout
        title="비대면 실명확인"
        bottomContent={
          <Btn_2Col
            leftLabel="재촬영"
            rightLabel="다음으로"
            leftVariant="outline"
            rightVariant="primary"
            onLeftClick={() => {
              setCapturedImage(null);
              setMode("live");
            }}
            onRightClick={() => navigate("/success")}
          />
        }
      >
        <div className="space-y-4 pb-2">
          <section className="space-y-2">
            <h2 className="text-2xl font-semibold leading-tight">틀린 정보를 수정해 주세요</h2>
            <p className="text-sm text-muted-foreground">여권에서 인식한 정보입니다.</p>
          </section>

          <section className="rounded-2xl border border-border overflow-hidden bg-background">
            {ocrResultRows.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="grid grid-cols-[140px_1fr] border-b border-border last:border-b-0">
                  <div className="px-4 py-4 flex items-center gap-3 bg-secondary/20">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-base whitespace-nowrap">{row.label}</p>
                  </div>
                  <div className="px-4 py-4 flex items-center">
                    <input
                      value={editableOcrValues[row.label] ?? ""}
                      onChange={(event) => handleOcrValueChange(row.label, event.target.value)}
                      className="w-full bg-transparent text-base outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="h-full w-full bg-black text-white relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-20 px-5 pt-10">
        <div className="flex items-center justify-between">
          <AppButton
            variant="unstyled"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </AppButton>
          <p className="font-semibold text-lg">여권 촬영</p>
          <div className="w-10" />
        </div>

        <div className="mt-5 text-center space-y-1">
          <p className="text-sm text-white/90">영역 안에 여권을 맞춰 주세요</p>
          <p className="text-xs text-white/70">하단 버튼을 누르면 촬영됩니다.</p>
        </div>
      </div>

      <div className="absolute inset-0 pt-40 pb-40 px-5">
        <div className="h-full w-full border-2 border-dashed border-white/70 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {cameraError && (
        <div className="absolute bottom-40 inset-x-5 rounded-xl bg-red-500/20 border border-red-400/40 p-3 text-sm text-center">
          {cameraError}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-8 space-y-4">
        <div className="flex items-center justify-center gap-2 text-xs text-white/80">
          <ShieldCheck className="w-4 h-4" />
          <p>여권이 훼손되거나 빛 반사가 없도록 주의해 주세요.</p>
        </div>

        <div className="flex justify-center">
          <AppButton
            variant="unstyled"
            onClick={handleCapture}
            className="w-20 h-20 rounded-full border-4 border-white bg-primary hover:bg-blue-700"
          />
        </div>
      </div>
    </div>
  );
}
