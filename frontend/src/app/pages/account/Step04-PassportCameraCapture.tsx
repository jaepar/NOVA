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
} from "lucide-react";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { Btn_2Col } from "../../components/design-system/Btn_2Col";
import { InlineBanner } from "../../components/design-system/InlineBanner";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { useStep5PassportCaptureStore } from "../../stores/pageStores";
import { CameraCapturePage } from "../../components/camera/CameraCapturePage";
import { certificateApi, type PassportResponse } from "../../../api";
import { useTranslation } from "../../i18n";

const ocrResultRows = [
  { id: "type", labelKey: "account.passportCapture.labels.type", icon: IdCard },
  { id: "issueCountry", labelKey: "account.passportCapture.labels.issueCountry", icon: Globe },
  { id: "num", labelKey: "account.passportCapture.labels.passportNumber", icon: IdCard },
  { id: "surName", labelKey: "account.passportCapture.labels.surname", icon: User },
  { id: "givenName", labelKey: "account.passportCapture.labels.givenName", icon: WholeWord },
  { id: "birthDate", labelKey: "account.passportCapture.labels.birthDate", icon: Calendar },
  { id: "sex", labelKey: "account.passportCapture.labels.sex", icon: User },
  { id: "nationlity", labelKey: "account.passportCapture.labels.nationality", icon: Flag },
  { id: "authority", labelKey: "account.passportCapture.labels.authority", icon: Landmark },
  { id: "issueDate", labelKey: "account.passportCapture.labels.issueDate", icon: CalendarDays },
  { id: "expireDate", labelKey: "account.passportCapture.labels.expiryDate", icon: CalendarClock },
] as const;

// TEMP_DUMMY: 여권 실물 테스트 전까지 사용하는 임시 표시 값. 이후 제거 대상.
const TEMP_DUMMY_OCR_VALUES: Record<string, string> = {
  type: "PM",
  issueCountry: "KOR",
  num: "M592W1577",
  surName: "PARK",
  givenName: "JAEHA",
  birthDate: "2001.02.05",
  sex: "M",
  nationlity: "REPUBLIC OF KOREA",
  authority: "MINISTRY OF FOREIGN AFFAIRS",
  issueDate: "2023.08.14",
  expireDate: "2033.08.14",
};

const mapPassportResponseToEditableValues = (passport: PassportResponse) => {
  return {
    type: passport.type ?? "",
    issueCountry: passport.issueCountry ?? "",
    num: passport.num ?? "",
    surName: passport.surName ?? "",
    givenName: passport.givenName ?? "",
    birthDate: passport.birthDate ?? "",
    sex: passport.sex ?? "",
    nationlity: passport.nationality ?? "",
    authority: passport.authority ?? "",
    issueDate: passport.issueDate ?? "",
    expireDate: passport.expireDate ?? "",
  };
};

export function PassportCameraCapture() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const mode = useStep5PassportCaptureStore((state) => state.mode);
  const cameraError = useStep5PassportCaptureStore(
    (state) => state.cameraError
  );
  const setMode = useStep5PassportCaptureStore((state) => state.setMode);
  const setCapturedImage = useStep5PassportCaptureStore(
    (state) => state.setCapturedImage
  );
  const setCameraError = useStep5PassportCaptureStore(
    (state) => state.setCameraError
  );
  const setParsedPassportData = useStep5PassportCaptureStore(
    (state) => state.setParsedPassportData
  );
  const reset = useStep5PassportCaptureStore((state) => state.reset);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [editableOcrValues, setEditableOcrValues] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(ocrResultRows.map((row) => [row.id, ""]))
  );

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    reset();
    return () => {
      stopCamera();
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
        setCameraError(t("account.passportCapture.cameraError", "카메라를 사용할 수 없습니다. 권한을 확인해 주세요."));
      }
    };

    startCamera();

    if (mode === "review") {
      stopCamera();
    }
  }, [mode, setCameraError]);

  const processImageForOcr = async (imageFile: File, imageDataUrl: string) => {
    setOcrError(null);
    setIsOcrProcessing(true);

    try {
      const ocrResult = await certificateApi.recognizePassport(imageFile);

      setEditableOcrValues(mapPassportResponseToEditableValues(ocrResult));
      setCapturedImage(imageDataUrl);
      setMode("review");
    } catch (error) {
      const errorCode =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: unknown }).response === "object"
          ? (error as { response?: { data?: { code?: string } } }).response
              ?.data?.code ?? ""
          : "";

      const message =
        errorCode === "USER-014"
          ? t("account.passportCapture.invalidPhoto", "사진이 올바르지 않습니다. 다시 촬영해 주세요.")
          : errorCode === "USER-009"
          ? t("account.passportCapture.retakePassport", "여권 이미지를 다시 촬영해 주세요.")
          : errorCode === "USER-013"
          ? t("account.passportCapture.recognitionFailed", "인식에 실패했습니다. 여권 위치와 조명을 확인해 주세요.")
          : error instanceof Error
          ? error.message
          : t("account.passportCapture.ocrDefaultError", "OCR 처리 중 오류가 발생했습니다. 다시 촬영해 주세요.");
      setOcrError(message);
      setMode("live");
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const blob = await (await fetch(imageDataUrl)).blob();
    const imageFile = new File([blob], "passport-capture.jpg", {
      type: "image/jpeg",
    });
    await processImageForOcr(imageFile, imageDataUrl);
  };

  const handleOcrValueChange = (id: string, value: string) => {
    setEditableOcrValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleMoveToStep06 = () => {
    setParsedPassportData({
      type: editableOcrValues["type"] ?? "",
      issueCountry: editableOcrValues["issueCountry"] ?? "",
      num: editableOcrValues["num"] ?? "",
      surName: editableOcrValues["surName"] ?? "",
      givenName: editableOcrValues["givenName"] ?? "",
      nationlity: editableOcrValues["nationlity"] ?? "",
      birthDate: editableOcrValues["birthDate"] ?? "",
      sex: editableOcrValues["sex"] ?? "",
      authority: editableOcrValues["authority"] ?? "",
      issueDate: editableOcrValues["issueDate"] ?? "",
      expireDate: editableOcrValues["expireDate"] ?? "",
    });
    navigate("/account/step-05");
  };

  const handleOpenReviewWithTempData = () => {
    // TEMP_DUMMY: 제거 대상. OCR 없이 더미 파싱 결과 확인용.
    setEditableOcrValues(TEMP_DUMMY_OCR_VALUES);
    setMode("review");
  };

  if (mode === "review") {
    return (
      <MobileLayout
        title={t("account.identityTitle", "비대면 실명확인")}
        titleKey="account.identityTitle"
        backPath="/account/step-03"
        bottomContent={
          <Btn_2Col
            leftLabel={t("account.retake", "재촬영")}
            rightLabel={t("account.next", "다음")}
            leftVariant="outline"
            rightVariant="primary"
            onLeftClick={() => {
              setCapturedImage(null);
              setMode("live");
            }}
            onRightClick={handleMoveToStep06}
          />
        }
      >
        <div className="space-y-4 pb-2">
          <section className="space-y-2">
            <h2 className="text-2xl font-semibold leading-tight">
              {t("account.passportCapture.reviewHeading", "여권 정보를 수정해 주세요")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("account.passportCapture.reviewDescription", "여권에서 인식한 정보입니다")}
            </p>
          </section>

          <section className="rounded-2xl border border-border overflow-hidden bg-background">
            {ocrResultRows.map((row) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.id}
                  className="grid grid-cols-[140px_1fr] border-b border-border last:border-b-0"
                >
                  <div className="px-4 py-4 flex items-center gap-3 bg-secondary/20">
                    <div className="w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-base whitespace-nowrap">{t(row.labelKey)}</p>
                  </div>
                  <div className="px-4 py-4 flex items-center">
                    <input
                      value={editableOcrValues[row.id] ?? ""}
                      onChange={(event) =>
                        handleOcrValueChange(row.id, event.target.value)
                      }
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
    <CameraCapturePage
      title={t("account.identityTitle", "비대면 실명확인")}
      onClose={() => navigate("/account/step-03")}
      headerBackgroundColor="#ffffff"
      headerTextColor="#000000"
      bottomBackgroundColor="#ffffff"
      contentBackgroundColor="#ffffff"
      contentTextColor="#000000"
      bottomContent={
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs text-black">
            <ShieldCheck className="w-4 h-4" />
            <p>{t("account.passportCapture.distortionWarning", "여권이 일그러지거나 빛 반사가 없도록 주의해 주세요")}</p>
          </div>
          <Btn_1Col onClick={handleCapture} disabled={isOcrProcessing}>
            {t("account.capture", "촬영하기")}
          </Btn_1Col>
          {/* TEMP: 제거 대상. OCR 테스트 중 임시 우회 버튼 */}
          <Btn_1Col
            onClick={handleOpenReviewWithTempData}
            variant="outline"
            disabled={isOcrProcessing}
          >
            {t("account.passportCapture.dummyResult", "더미 파싱 결과 보기 (임시)")}
          </Btn_1Col>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="h-[58vh] border-2 border-dashed border-border rounded-xl overflow-hidden bg-secondary flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {cameraError && (
        <InlineBanner message={cameraError} variant="error" className="mt-4" />
      )}
      {ocrError && (
        <InlineBanner message={ocrError} variant="error" className="mt-4" />
      )}
      {isOcrProcessing && (
        <div className="mt-4 rounded-xl bg-secondary border border-border p-3 text-sm text-center text-black">
          {t("account.passportCapture.ocrProcessing", "OCR 분석 중입니다. 잠시만 기다려 주세요.")}
        </div>
      )}
    </CameraCapturePage>
  );
}
