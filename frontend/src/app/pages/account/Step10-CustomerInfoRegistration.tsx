import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { userApi } from "../../../api";
import { AccountMobileLayout } from "./components/AccountMobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { AppButton } from "../../components/design-system/AppButton";
import {
  useAccountCreateFlowStore,
  useMainPageStore,
  useSignupPageStore,
} from "../../stores/pageStores";
import { useProfileStore } from "../../stores/profileStore";
import { useTranslation } from "../../i18n";

const KAKAO_POSTCODE_SCRIPT_ID = "kakao-postcode-script";
const KAKAO_POSTCODE_SCRIPT_SRC =
  "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

type KakaoPostcodeData = {
  userSelectedType: "R" | "J";
  zonecode: string;
  addressEnglish: string;
  roadAddressEnglish: string;
  jibunAddressEnglish: string;
  autoRoadAddressEnglish: string;
  autoJibunAddressEnglish: string;
  roadAddress: string;
  jibunAddress: string;
  bname: string;
  buildingName: string;
  apartment: "Y" | "N";
};

type KakaoPostcodeOptions = {
  oncomplete: (data: KakaoPostcodeData) => void;
};

declare global {
  interface Window {
    kakao?: {
      Postcode: new (options: KakaoPostcodeOptions) => {
        open: () => void;
      };
    };
  }
}

let kakaoPostcodeScriptPromise: Promise<void> | null = null;

function loadKakaoPostcodeScript() {
  if (window.kakao?.Postcode) {
    return Promise.resolve();
  }

  if (kakaoPostcodeScriptPromise) {
    return kakaoPostcodeScriptPromise;
  }

  kakaoPostcodeScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(KAKAO_POSTCODE_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => {
          kakaoPostcodeScriptPromise = null;
          reject(new Error("Kakao postcode load failed"));
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = KAKAO_POSTCODE_SCRIPT_ID;
    script.src = KAKAO_POSTCODE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      kakaoPostcodeScriptPromise = null;
      reject(new Error("Kakao postcode load failed"));
    };
    document.head.appendChild(script);
  });

  return kakaoPostcodeScriptPromise;
}

function formatSelectedAddress(data: KakaoPostcodeData) {
  if (data.userSelectedType !== "R") {
    return data.jibunAddress;
  }

  const extraAddressParts = [
    data.bname && /[동로가]$/.test(data.bname) ? data.bname : "",
    data.buildingName && data.apartment === "Y" ? data.buildingName : "",
  ].filter(Boolean);
  const extraAddress = extraAddressParts.length > 0 ? ` (${extraAddressParts.join(", ")})` : "";

  return `${data.roadAddress}${extraAddress}`;
}

export function Step10CustomerInfoRegistration() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const addressDetailInputRef = useRef<HTMLInputElement>(null);
  const [addressSearchError, setAddressSearchError] = useState("");
  const signupName = useSignupPageStore((state) => state.name);
  const signupEmail = useSignupPageStore((state) => state.email);
  const isLoggedIn = useMainPageStore((state) => state.isLoggedIn);
  const profile = useProfileStore((state) => state.profile);
  const setProfileFromResponse = useProfileStore((state) => state.setProfileFromResponse);
  const address = useAccountCreateFlowStore((state) => state.address);
  const addressDetail = useAccountCreateFlowStore((state) => state.addressDetail);
  const setCustomerInfo = useAccountCreateFlowStore((state) => state.setCustomerInfo);

  useEffect(() => {
    if (!isLoggedIn || profile) {
      return;
    }

    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await userApi.getProfile();

        if (isMounted) {
          setProfileFromResponse(response);
        }
      } catch {
        // Fall back to existing signup-store values when profile loading is unavailable.
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, profile, setProfileFromResponse]);

  const name = profile?.name ?? signupName;
  const email = profile?.email ?? signupEmail;

  const canSubmit = useMemo(
    () => address.trim().length > 0 && addressDetail.trim().length > 0,
    [address, addressDetail]
  );

  const openAddressSearch = async () => {
    try {
      setAddressSearchError("");
      await loadKakaoPostcodeScript();

      new window.kakao!.Postcode({
        oncomplete: (data) => {
          setCustomerInfo(formatSelectedAddress(data), addressDetail);
          window.setTimeout(() => addressDetailInputRef.current?.focus(), 0);
        },
      }).open();
    } catch {
      setAddressSearchError(t("account.customerInfo.addressSearchError"));
    }
  };

  return (
    <AccountMobileLayout
      title={t("account.customerInfoTitle")}
      titleKey="account.customerInfoTitle"
      backPath="/account/step-09"
      bottomContent={
        <Btn_1Col
          disabled={!canSubmit}
          onClick={() => navigate("/account/step-11")}
        >
          {t("account.next")}
        </Btn_1Col>
      }
    >
      <div className="space-y-8 pb-2">
        <section className="space-y-2">
          <h2 className="text-2xl leading-tight font-semibold text-foreground">
            {t("account.customerInfo.heading")
              .split("\n")
              .map((line, index, lines) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < lines.length - 1 && <br />}
                </span>
              ))}
          </h2>
        </section>

        <section className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("account.customerInfo.autoFilled")}
          </p>
          <div className="rounded-xl border border-border bg-background divide-y divide-border">
            <div className="grid grid-cols-[88px_1fr] gap-2 px-4 py-4">
              <p className="text-sm text-foreground">{t("account.customerInfo.name")}</p>
              <p className="text-sm text-foreground">{name || "-"}</p>
            </div>
            <div className="grid grid-cols-[88px_1fr] gap-2 px-4 py-4">
              <p className="text-sm text-foreground">{t("account.customerInfo.email")}</p>
              <p className="text-sm text-foreground break-all">{email || "-"}</p>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <p className="text-sm text-muted-foreground">
            {t("account.customerInfo.editable")}
          </p>

          <div className="space-y-2">
            <label className="block text-foreground">
              {t("account.customerInfo.address")}
            </label>
            <AppButton
              type="button"
              variant="unstyled"
              onClick={openAddressSearch}
              aria-label={t("account.customerInfo.addressSearchAria")}
              className="flex w-full items-center rounded-lg border border-border bg-input-background py-3 pl-4 pr-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ fontSize: "16px" }}
            >
              <span
                className={`min-w-0 flex-1 truncate ${
                  address ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {address || t("account.customerInfo.addressPlaceholder")}
              </span>
              <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
            </AppButton>
            {addressSearchError ? (
              <p className="text-sm text-destructive">{addressSearchError}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-foreground">
              {t("account.customerInfo.addressDetail")}
            </label>
            <input
              ref={addressDetailInputRef}
              type="text"
              placeholder={t("account.customerInfo.addressDetailPlaceholder")}
              value={addressDetail}
              onChange={(event) => setCustomerInfo(address, event.target.value)}
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              style={{ fontSize: "16px" }}
            />
          </div>
        </section>
      </div>
    </AccountMobileLayout>
  );
}
