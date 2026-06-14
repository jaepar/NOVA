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
import { useTranslation } from "../../i18n";

const awsRegion = import.meta.env.VITE_AWS_REGION as string | undefined;
const identityPoolId = import.meta.env.VITE_AWS_COGNITO_IDENTITY_POOL_ID as
  | string
  | undefined;
const registeredImageBucket =
  (import.meta.env.VITE_LIVENESS_REGISTERED_IMAGE_BUCKET as
    | string
    | undefined) ?? "nova-object-bucket";
const STEP08_PATH = "/account/step-07";

const HiddenPhotosensitiveWarning = () => null;

export function LivenessCameraCapture() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sessionId = useLivenessFlowStore((state) => state.sessionId);
  const expiresAt = useLivenessFlowStore((state) => state.expiresAt);
  const registeredPassportIssueCountry = useLivenessFlowStore(
    (state) => state.registeredPassportIssueCountry
  );
  const registeredPassportNumber = useLivenessFlowStore(
    (state) => state.registeredPassportNumber
  );
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
  const translatedLivenessDisplayText = useMemo(
    () => ({
      startScreenBeginCheckText: t("account.livenessCamera.start"),
      cancelLivenessCheckText: t("account.livenessCamera.close"),
      hintCenterFaceText: t("account.livenessCamera.centerFace"),
      hintMoveFaceFrontOfCameraText: t("account.livenessCamera.faceFront"),
      hintTooFarText: t("account.livenessCamera.tooFar"),
      hintTooCloseText: t("account.livenessCamera.tooClose"),
      hintHoldFaceForFreshnessText: t("account.livenessCamera.hold"),
      hintConnectingText: t("account.livenessCamera.connecting"),
      hintVerifyingText: t("account.livenessCamera.verifying"),
      hintCheckCompleteText: t("account.livenessCamera.complete"),
      waitingCameraPermissionText: t("account.livenessCamera.waitingPermission"),
      retryCameraPermissionsText: t("account.livenessCamera.retryPermission"),
      cameraNotFoundHeadingText: t("account.livenessCamera.cameraNotFoundHeading"),
      cameraNotFoundMessageText: t("account.livenessCamera.cameraNotFoundMessage"),
      serverHeaderText: t("account.livenessCamera.serverHeader"),
      serverMessageText: t("account.livenessCamera.serverMessage"),
      clientHeaderText: t("account.livenessCamera.clientHeader"),
      clientMessageText: t("account.livenessCamera.clientMessage"),
      tryAgainText: t("account.livenessCamera.tryAgain"),
    }),
    [t]
  );

  const triggerSdkStart = () => {
    const root = detectorContainerRef.current;
    if (!root) return;

    const startButton = Array.from(
      root.querySelectorAll<HTMLButtonElement>("button")
    ).find((button) => button.textContent?.trim() === "얼굴 인증 시작");

    startButton?.click();
  };

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
      translatedLivenessDisplayText.hintCenterFaceText,
      translatedLivenessDisplayText.hintMoveFaceFrontOfCameraText,
      translatedLivenessDisplayText.hintTooFarText,
      translatedLivenessDisplayText.hintTooCloseText,
      translatedLivenessDisplayText.hintHoldFaceForFreshnessText,
      translatedLivenessDisplayText.hintVerifyingText,
      translatedLivenessDisplayText.hintCheckCompleteText,
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
  }, [detectorRenderKey, isDetectorVisible, translatedLivenessDisplayText]);

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
        (button) => button.textContent?.trim() === translatedLivenessDisplayText.startScreenBeginCheckText
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
  }, [detectorRenderKey, isDetectorVisible, translatedLivenessDisplayText.startScreenBeginCheckText]);

  const hasAwsConfig = Boolean(awsRegion && identityPoolId);

  const credentialProvider = useMemo(() => {
    if (!hasAwsConfig) return undefined;
    return fromCognitoIdentityPool({
      clientConfig: { region: awsRegion! },
      identityPoolId: identityPoolId!,
    });
  }, [hasAwsConfig]);

  const registeredImageKey = useMemo(() => {
    if (registeredPassportIssueCountry && registeredPassportNumber) {
      return `goverment/${registeredPassportIssueCountry}-${registeredPassportNumber}/profile.jpg`;
    }

    return (
      (import.meta.env.VITE_LIVENESS_REGISTERED_IMAGE_KEY as
        | string
        | undefined) ?? "goverment/KOR-M592W1577/profile.jpg"
    );
  }, [registeredPassportIssueCountry, registeredPassportNumber]);

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
      setFailureMessage(t("account.livenessCamera.failed"));
    } catch {
      setIsDetectorVisible(false);
      setHasStartedLiveness(false);
      stopCameraTracksRepeatedly();
      setFailureMessage(t("account.livenessCamera.resultFailed"));
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
          t("account.livenessCamera.retrySessionFailed")
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
      <MobileLayout title={t("account.identityTitle")} titleKey="account.identityTitle" backPath={STEP08_PATH}>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t("account.livenessCamera.configRequiredTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("account.livenessCamera.configRequiredDescription")}
          </p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title={t("account.identityTitle")}
      titleKey="account.identityTitle"
      headerType="close"
      onClose={handleCancel}
      closePath={STEP08_PATH}
      bottomContent={
        failureMessage ? (
          <Btn_1Col onClick={handleRetry} disabled={isRetrying}>
            {isRetrying ? t("account.livenessCamera.retryPreparing") : t("account.livenessCamera.retake")}
          </Btn_1Col>
        ) : isDetectorVisible && isCameraActive && !hasStartedLiveness ? (
          <Btn_1Col onClick={triggerSdkStart}>
            {translatedLivenessDisplayText.startScreenBeginCheckText}
          </Btn_1Col>
        ) : undefined
      }
    >
      <div
        className={`space-y-4 nova-liveness-surface ${
          isDetectorVisible && isCameraActive && !hasStartedLiveness
            ? "nova-liveness-prestart"
            : ""
        }`}
        ref={detectorContainerRef}
      >
        {isDetectorVisible && sessionId && credentialProvider && (
          <FaceLivenessDetector
            key={`${sessionId}-${detectorRenderKey}`}
            sessionId={sessionId}
            region={awsRegion!}
            displayText={translatedLivenessDisplayText}
            components={{ PhotosensitiveWarning: HiddenPhotosensitiveWarning }}
            onAnalysisComplete={handleAnalysisComplete}
            onUserCancel={handleCancel}
            onError={() => {
              setIsDetectorVisible(false);
              stopCameraTracksRepeatedly();
              setFailureMessage(t("account.livenessCamera.failed"));
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
