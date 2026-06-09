import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity/dist-es/fromCognitoIdentityPool";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import "@aws-amplify/ui-react-liveness/styles.css";
import "../../styles/liveness/LivenessCameraCapture.css";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { InlineBanner } from "../../components/design-system/InlineBanner";
import { certificateApi } from "../../../api";
import { useLivenessFlowStore } from "../../stores/pageStores";

const awsRegion = import.meta.env.VITE_AWS_REGION as string | undefined;
const identityPoolId = import.meta.env.VITE_AWS_COGNITO_IDENTITY_POOL_ID as
  | string
  | undefined;
const registeredImageBucket =
  (import.meta.env.VITE_LIVENESS_REGISTERED_IMAGE_BUCKET as
    | string
    | undefined) ?? "nova-object-bucket";
const registeredImageKey =
  (import.meta.env.VITE_LIVENESS_REGISTERED_IMAGE_KEY as string | undefined) ??
  "goverment/KOR-M592W1577/profile.jpg";
const STEP08_PATH = "/account/step-07";

const livenessDisplayText = {
  startScreenBeginCheckText: "얼굴 인증 시작",
  cancelLivenessCheckText: "닫기",
  hintCenterFaceText: "얼굴을 원 안 중앙에 맞춰 주세요.",
  hintMoveFaceFrontOfCameraText: "카메라를 정면으로 바라봐 주세요.",
  hintTooFarText: "카메라에 조금 더 가까이 와 주세요.",
  hintTooCloseText: "카메라와 조금 거리를 두어 주세요.",
  hintHoldFaceForFreshnessText: "상태를 유지해 주세요.",
  hintConnectingText: "인증 준비 중입니다.",
  hintVerifyingText: "인증 결과를 확인하고 있습니다.",
  hintCheckCompleteText: "잠시만 기다려주십시오...",
  waitingCameraPermissionText: "카메라 권한 허용을 기다리고 있습니다.",
  retryCameraPermissionsText: "카메라 권한을 허용해 주세요.",
  cameraNotFoundHeadingText: "카메라를 찾을 수 없습니다.",
  cameraNotFoundMessageText: "카메라 연결 상태를 확인한 뒤 다시 시도해 주세요.",
  serverHeaderText: "서버 오류",
  serverMessageText: "서버 문제로 인증을 완료하지 못했습니다.",
  clientHeaderText: "인증 오류",
  clientMessageText: "인증 처리 중 오류가 발생했습니다.",
  tryAgainText: "다시 시도",
} as const;

const HiddenPhotosensitiveWarning = () => null;

export function LivenessCameraCapture() {
  const navigate = useNavigate();
  const sessionId = useLivenessFlowStore((state) => state.sessionId);
  const expiresAt = useLivenessFlowStore((state) => state.expiresAt);
  const setSession = useLivenessFlowStore((state) => state.setSession);
  const resetSession = useLivenessFlowStore((state) => state.resetSession);

  const detectorContainerRef = useRef<HTMLDivElement | null>(null);
  const hasRedirectedRef = useRef(false);
  const isCancellingRef = useRef(false);
  const trackedStreamsRef = useRef<Set<MediaStream>>(new Set());
  const restoreGetUserMediaRef = useRef<(() => void) | null>(null);
  const [isDetectorVisible, setIsDetectorVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [failureMessage, setFailureMessage] = useState("");
  const [detectorRenderKey, setDetectorRenderKey] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [liveHintText, setLiveHintText] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasStartedLiveness, setHasStartedLiveness] = useState(false);

  const navigateToStep08 = () => {
    navigate(STEP08_PATH, {
      replace: true,
      state: { preserveStep08State: true },
    });
  };

  const collectVideoElementsDeep = () => {
    const videos: HTMLVideoElement[] = [];
    const visited = new Set<Node>();

    const walk = (root: ParentNode) => {
      root.querySelectorAll("video").forEach((video) => {
        if (!visited.has(video)) {
          visited.add(video);
          videos.push(video as HTMLVideoElement);
        }
      });

      root.querySelectorAll("*").forEach((element) => {
        const shadowRoot = (element as HTMLElement).shadowRoot;
        if (shadowRoot) walk(shadowRoot);
      });
    };

    walk(document);
    return videos;
  };

  const stopCameraTracks = () => {
    const videos = collectVideoElementsDeep();

    videos.forEach((video) => {
      const mediaStream = video.srcObject;
      if (mediaStream instanceof MediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      video.srcObject = null;
      video.pause();
    });

    trackedStreamsRef.current.forEach((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
    trackedStreamsRef.current.clear();
  };

  const stopCameraTracksRepeatedly = () => {
    stopCameraTracks();
    window.setTimeout(stopCameraTracks, 500);
  };

  useEffect(() => {
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.getUserMedia) return;

    const originalGetUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
    mediaDevices.getUserMedia = (async (
      ...args: Parameters<typeof originalGetUserMedia>
    ) => {
      const stream = await originalGetUserMedia(...args);
      trackedStreamsRef.current.add(stream);
      return stream;
    }) as typeof mediaDevices.getUserMedia;

    restoreGetUserMediaRef.current = () => {
      mediaDevices.getUserMedia = originalGetUserMedia;
    };

    return () => {
      restoreGetUserMediaRef.current?.();
      restoreGetUserMediaRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (hasRedirectedRef.current) return;

    if (!sessionId) {
      hasRedirectedRef.current = true;
      navigateToStep08();
      return;
    }

    if (expiresAt && Date.parse(expiresAt) <= Date.now()) {
      hasRedirectedRef.current = true;
      resetSession();
      navigateToStep08();
    }
  }, [expiresAt, sessionId, resetSession]);

  useEffect(() => {
    const handlePageLeave = () => stopCameraTracksRepeatedly();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") stopCameraTracksRepeatedly();
    };

    window.addEventListener("pagehide", handlePageLeave);
    window.addEventListener("beforeunload", handlePageLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handlePageLeave);
      window.removeEventListener("beforeunload", handlePageLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      restoreGetUserMediaRef.current?.();
      stopCameraTracksRepeatedly();
    };
  }, []);

  useEffect(() => {
    const root = detectorContainerRef.current;
    if (!root) return;
    const main = root.closest("main");
    if (!main) return;

    const previousOverflowY = main.style.overflowY;
    main.style.overflowY = "hidden";

    return () => {
      main.style.overflowY = previousOverflowY;
    };
  }, []);

  useEffect(() => {
    if (!isDetectorVisible) return;

    const hintCandidates = new Set([
      livenessDisplayText.hintCenterFaceText,
      livenessDisplayText.hintMoveFaceFrontOfCameraText,
      livenessDisplayText.hintTooFarText,
      livenessDisplayText.hintTooCloseText,
      livenessDisplayText.hintHoldFaceForFreshnessText,
      livenessDisplayText.hintVerifyingText,
      livenessDisplayText.hintCheckCompleteText,
    ]);

    const updateHintFromDom = () => {
      const root = detectorContainerRef.current;
      if (!root) return;
      const elements = Array.from(
        root.querySelectorAll<HTMLElement>("div, span, p")
      );
      const matched = elements.find((element) => {
        const text = element.textContent?.trim();
        if (!text || !hintCandidates.has(text)) return false;
        const style = window.getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden";
      });
      setLiveHintText(matched?.textContent?.trim() ?? "");
    };

    updateHintFromDom();
    const observer = new MutationObserver(updateHintFromDom);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => observer.disconnect();
  }, [detectorRenderKey, isDetectorVisible]);

  useEffect(() => {
    if (!isDetectorVisible) {
      setIsCameraActive(false);
      return;
    }

    const updateCameraActive = () => {
      const root = detectorContainerRef.current;
      if (!root) {
        setIsCameraActive(false);
        return;
      }
      const video = root.querySelector<HTMLVideoElement>("video");
      const stream = video?.srcObject;
      const active =
        Boolean(video) &&
        Boolean(stream instanceof MediaStream && stream.active) &&
        (video?.readyState ?? 0) >= 2;
      setIsCameraActive(active);
    };

    updateCameraActive();
    const intervalId = window.setInterval(updateCameraActive, 200);
    return () => window.clearInterval(intervalId);
  }, [detectorRenderKey, isDetectorVisible]);

  useEffect(() => {
    if (!isDetectorVisible) return;

    const root = detectorContainerRef.current;
    if (!root) return;

    const attachStartButtonHandler = () => {
      const startButton = Array.from(root.querySelectorAll<HTMLButtonElement>("button")).find(
        (button) => button.textContent?.trim() === "얼굴 인증 시작"
      );
      if (!startButton) return () => {};

      const onStart = () => setHasStartedLiveness(true);
      startButton.addEventListener("click", onStart);
      return () => startButton.removeEventListener("click", onStart);
    };

    let detach = attachStartButtonHandler();
    const observer = new MutationObserver(() => {
      detach();
      detach = attachStartButtonHandler();
    });
    observer.observe(root, { subtree: true, childList: true });

    return () => {
      observer.disconnect();
      detach();
    };
  }, [detectorRenderKey, isDetectorVisible]);

  const hasAwsConfig = Boolean(awsRegion && identityPoolId);

  const credentialProvider = useMemo(() => {
    if (!hasAwsConfig) return undefined;
    return fromCognitoIdentityPool({
      clientConfig: { region: awsRegion! },
      identityPoolId: identityPoolId!,
    });
  }, [hasAwsConfig]);

  const handleAnalysisComplete = async () => {
    if (!sessionId) return;

    try {
      const result = await certificateApi.finalizeLiveness(sessionId, {
        registeredImageBucket,
        registeredImageKey,
      });
      if (result.decision === "PASS") {
        setIsDetectorVisible(false);
        setHasStartedLiveness(false);
        stopCameraTracksRepeatedly();
        window.setTimeout(() => navigate("/account/step-09"), 120);
        return;
      }
      setIsDetectorVisible(false);
      setHasStartedLiveness(false);
      stopCameraTracksRepeatedly();
      setFailureMessage("실명 인증에 실패했습니다. 다시 시도해 주세요.");
    } catch {
      setIsDetectorVisible(false);
      setHasStartedLiveness(false);
      stopCameraTracksRepeatedly();
      setFailureMessage("인증 결과 확인에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  const handleRetry = () => {
    if (isRetrying) return;
    setFailureMessage("");
    setLiveHintText("");
    setHasStartedLiveness(false);
    setIsRetrying(true);
    (async () => {
      try {
        const nextSession = await certificateApi.createLivenessSession();
        if (!nextSession?.sessionId || !nextSession?.expiresAt) {
          throw new Error("invalid_liveness_session");
        }
        setSession(nextSession.sessionId, nextSession.expiresAt);
        setFailureMessage("");
        setDetectorRenderKey((prev) => prev + 1);
        setIsDetectorVisible(true);
      } catch {
        setFailureMessage(
          "재촬영 세션 생성에 실패했습니다. 잠시 후 다시 시도해 주세요."
        );
      } finally {
        setIsRetrying(false);
      }
    })();
  };

  const handleExitToStep08 = () => {
    if (isExiting) return;
    setIsExiting(true);
    setIsDetectorVisible(false);
    setHasStartedLiveness(false);
    stopCameraTracksRepeatedly();
    resetSession();
    window.setTimeout(() => {
      stopCameraTracksRepeatedly();
      navigateToStep08();
    }, 160);
  };

  const handleCancel = () => {
    if (isCancellingRef.current) return;
    isCancellingRef.current = true;
    handleExitToStep08();
  };

  if (!hasAwsConfig) {
    return (
      <MobileLayout title="비대면 실명확인" backPath={STEP08_PATH}>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Liveness 설정이 필요합니다</h2>
          <p className="text-sm text-muted-foreground">
            VITE_AWS_REGION, VITE_AWS_COGNITO_IDENTITY_POOL_ID 환경변수를 설정해
            주세요.
          </p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title="비대면 실명확인"
      headerType="close"
      onClose={handleCancel}
      closePath={STEP08_PATH}
      bottomContent={
        failureMessage ? (
          <Btn_1Col onClick={handleRetry} disabled={isRetrying}>
            {isRetrying ? "재촬영 준비 중..." : "재촬영"}
          </Btn_1Col>
        ) : undefined
      }
    >
      <div
        className={`space-y-4 nova-liveness-surface ${
          hasStartedLiveness ? "nova-liveness-active" : ""
        }`}
        ref={detectorContainerRef}
      >
        {isDetectorVisible && sessionId && credentialProvider && (
          <FaceLivenessDetector
            key={`${sessionId}-${detectorRenderKey}`}
            sessionId={sessionId}
            region={awsRegion!}
            displayText={livenessDisplayText}
            components={{ PhotosensitiveWarning: HiddenPhotosensitiveWarning }}
            onAnalysisComplete={handleAnalysisComplete}
            onUserCancel={handleCancel}
            onError={() => {
              setIsDetectorVisible(false);
              stopCameraTracksRepeatedly();
              setFailureMessage("인증에 실패했습니다. 다시 시도해 주세요.");
            }}
            config={{ credentialProvider }}
          />
        )}
        {isDetectorVisible &&
          hasStartedLiveness &&
          isCameraActive &&
          liveHintText &&
          !failureMessage && (
            <InlineBanner message={liveHintText} variant="info" />
          )}
        {!isDetectorVisible && failureMessage && (
          <div className="nova-liveness-placeholder" aria-hidden="true">
            <div className="nova-liveness-placeholder__oval" />
          </div>
        )}
        {failureMessage && (
          <InlineBanner message={failureMessage} variant="error" />
        )}
      </div>
    </MobileLayout>
  );
}
