import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { InlineBanner } from "../../components/design-system/InlineBanner";
import { useTranslation } from "../../i18n";
import {
  useLivenessFlowStore,
  useStep5PassportCaptureStore,
} from "../../stores/pageStores";

type ParsedNfcRecord = {
  recordType: string;
  mediaType?: string;
  id?: string;
  encoding?: string;
  lang?: string;
  data?: string;
};

type PassportLikeData = {
  type: string;
  issueCountry: string;
  num: string;
  surName: string;
  givenName: string;
  nationlity: string;
  birthDate: string;
  sex: string;
  authority: string;
  issueDate: string;
  expireDate: string;
};

function parseNdefRecords(event: NDEFReadingEvent): ParsedNfcRecord[] {
  const decoder = new TextDecoder();

  return event.message.records.map((record) => {
    const parsedData = record.data ? decoder.decode(record.data) : "";
    return {
      recordType: record.recordType,
      mediaType: record.mediaType,
      id: record.id,
      encoding: (record as { encoding?: string }).encoding,
      lang: (record as { lang?: string }).lang,
      data: parsedData,
    };
  });
}

export function NfcGuide() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const parsedPassportData = useStep5PassportCaptureStore(
    (state) => state.parsedPassportData
  );
  const setParsedPassportData = useStep5PassportCaptureStore(
    (state) => state.setParsedPassportData
  );
  const setRegisteredPassportIdentity = useLivenessFlowStore(
    (state) => state.setRegisteredPassportIdentity
  );
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusVariant, setStatusVariant] = useState<
    "info" | "success" | "warning" | "error"
  >("info");

  const comparisonFields: Array<{
    key: keyof PassportLikeData;
    label: string;
  }> = useMemo(
    () => [
      { key: "type", label: t("certificate.passportLabelType") },
      { key: "issueCountry", label: t("certificate.passportLabelCountryCode") },
      { key: "num", label: t("certificate.passportLabelNumber") },
      { key: "surName", label: t("certificate.passportLabelSurname") },
      { key: "givenName", label: t("certificate.passportLabelGivenName") },
      { key: "nationlity", label: t("certificate.passportLabelNationality") },
      { key: "birthDate", label: t("certificate.passportLabelBirthDate") },
      { key: "sex", label: t("certificate.passportLabelGender") },
      { key: "authority", label: t("certificate.passportLabelAuthority") },
      { key: "issueDate", label: t("certificate.passportLabelIssueDate") },
      { key: "expireDate", label: t("certificate.passportLabelExpiryDate") },
    ],
    [t]
  );

  function comparePassportData(
    step05Data: PassportLikeData,
    nfcData: PassportLikeData
  ) {
    const mismatches = comparisonFields.filter(
      ({ key }) => step05Data[key] !== nfcData[key]
    );
    return { isMatch: mismatches.length === 0 };
  }

  const handleStartNfcTagging = async () => {
    if (isScanning) return;
    if (!parsedPassportData) {
      setStatusMessage(t("certificate.nfcNoPassportData"));
      setStatusVariant("warning");
      return;
    }

    if (!("NDEFReader" in window)) {
      setStatusMessage(t("certificate.nfcUnsupported"));
      setStatusVariant("warning");
      console.warn("[NFC] Web NFC is not supported in this browser.");
      return;
    }

    setIsScanning(true);
    setStatusMessage(t("certificate.nfcWaiting"));
    setStatusVariant("info");

    try {
      const reader = new NDEFReader();

      const readEvent = await new Promise<NDEFReadingEvent>(
        (resolve, reject) => {
          let timeoutId: ReturnType<typeof setTimeout> | null = null;
          let settled = false;

          const cleanup = () => {
            if (timeoutId) clearTimeout(timeoutId);
            reader.onreading = null;
            reader.onreadingerror = null;
          };

          timeoutId = setTimeout(() => {
            if (settled) return;
            settled = true;
            cleanup();
            reject(new Error("NFC_TIMEOUT"));
          }, 10000);

          reader.onreading = (event) => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve(event);
          };

          reader.onreadingerror = () => {
            if (settled) return;
            settled = true;
            cleanup();
            reject(new Error("NFC_READ_ERROR"));
          };

          reader.scan().catch((error) => {
            if (settled) return;
            settled = true;
            cleanup();
            reject(error);
          });
        }
      );

      const parsedRecords = parseNdefRecords(readEvent);
      const firstJsonRecord = parsedRecords.find((record) => {
        if (!record.data) return false;
        const trimmed = record.data.trim();
        return trimmed.startsWith("{") && trimmed.endsWith("}");
      });

      if (!firstJsonRecord?.data) {
        setStatusMessage(t("certificate.nfcJsonNotFound"));
        setStatusVariant("warning");
        return;
      }

      let parsedNfcData: PassportLikeData;
      try {
        parsedNfcData = JSON.parse(firstJsonRecord.data) as PassportLikeData;
      } catch {
        setStatusMessage(t("certificate.nfcJsonParseFailed"));
        setStatusVariant("warning");
        return;
      }

      const compareResult = comparePassportData(
        parsedPassportData,
        parsedNfcData
      );

      if (!compareResult.isMatch) {
        setStatusMessage(t("certificate.nfcMismatch"));
        setStatusVariant("error");
        return;
      }

      setRegisteredPassportIdentity(
        parsedPassportData.issueCountry,
        parsedPassportData.num
      );
      // 인증 성공 직전에만 인증 비교용 데이터를 폐기
      setParsedPassportData(null);
      setStatusMessage(t("certificate.nfcSuccess"));
      setStatusVariant("success");
      navigate("/certificate/step-07");
    } catch (error) {
      if (error instanceof Error && error.message === "NFC_TIMEOUT") {
        setStatusMessage(t("certificate.nfcTimeout"));
      } else if (
        error instanceof DOMException &&
        error.name === "NotAllowedError"
      ) {
        setStatusMessage(t("certificate.nfcPermissionDenied"));
      } else {
        setStatusMessage(t("certificate.nfcReadFailed"));
      }
      setStatusVariant("error");
      console.error("[NFC] read failed", error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <MobileLayout
      title={t("certificate.title")}
      backPath="/certificate/step-04"
      bottomContent={
        <Btn_1Col onClick={handleStartNfcTagging} disabled={isScanning}>
          {isScanning
            ? t("certificate.nfcTagging")
            : t("certificate.nfcTagStart")}
        </Btn_1Col>
      }
    >
      <div className="space-y-4 pb-2">
        <section className="space-y-1">
          <h2 className="text-2xl font-semibold leading-tight">
            {t("certificate.step06Heading")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("certificate.step06Subtitle")}
          </p>
        </section>

        <section className="rounded-2xl bg-secondary p-6">
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-border bg-background min-h-[280px] flex items-center justify-center text-center px-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("certificate.nfcImageArea")}
                <br />
                {t("certificate.nfcRecommendedSize")}
                <br />
                {t("certificate.nfcRatio")}
              </p>
            </div>
            <p className="text-sm text-center text-foreground/90">
              {t("certificate.nfcPhoneInstruction")}
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-secondary p-4">
          <ul className="text-sm text-foreground/90 space-y-2 list-disc pl-5">
            <li>{t("certificate.nfcCheck1")}</li>
            <li>{t("certificate.nfcCheck2")}</li>
          </ul>
        </section>

        {statusMessage ? (
          <InlineBanner message={statusMessage} variant={statusVariant} />
        ) : null}
      </div>
    </MobileLayout>
  );
}
