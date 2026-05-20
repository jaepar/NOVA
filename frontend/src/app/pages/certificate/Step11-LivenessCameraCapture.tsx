import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ScanFace, X } from "lucide-react";
import { AppButton } from "../../components/design-system/AppButton";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";

export function LivenessCameraCapture() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        // 권한 거부 시에도 화면 구조 유지
      }
    };

    startCamera();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  return (
    <div className="h-full w-full bg-black text-white flex flex-col">
      <div className="px-5 pt-8">
        <AppButton
          variant="unstyled"
          onClick={() => navigate("/certificate/step-10", { state: { preserveStep10State: true } })}
          className="p-2 -ml-2 rounded-lg hover:bg-white/10"
        >
          <X className="w-7 h-7" />
        </AppButton>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold leading-tight text-center">
            본인 확인을 위해
            <br />
            얼굴을 촬영해 주세요
          </h2>

          <div className="flex justify-center">
            <div className="relative w-[320px] h-[320px] rounded-full border-4 border-blue-500/90 overflow-hidden">
              <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="space-y-0 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="px-4 py-4 flex items-center gap-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <ScanFace className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-lg">정면을 바라봐 주세요</p>
            </div>
            <div className="px-4 py-4 flex items-center gap-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <ScanFace className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-lg">눈을 깜빡여 주세요</p>
            </div>
            <div className="px-4 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <ScanFace className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-lg">천천히 고개를 좌우로 돌려 주세요</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-8">
        <Btn_1Col onClick={() => navigate("/success")}>동의하고 촬영하기</Btn_1Col>
      </div>
    </div>
  );
}
