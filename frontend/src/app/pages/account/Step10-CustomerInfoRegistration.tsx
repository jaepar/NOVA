import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import {
  useAccountCreateFlowStore,
  useSignupPageStore,
} from "../../stores/pageStores";
import { useTranslation } from "../../i18n";

export function Step10CustomerInfoRegistration() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const name = useSignupPageStore((state) => state.name);
  const email = useSignupPageStore((state) => state.email);
  const address = useAccountCreateFlowStore((state) => state.address);
  const addressDetail = useAccountCreateFlowStore((state) => state.addressDetail);
  const setCustomerInfo = useAccountCreateFlowStore((state) => state.setCustomerInfo);

  const canSubmit = useMemo(
    () => address.trim().length > 0 && addressDetail.trim().length > 0,
    [address, addressDetail]
  );

  return (
    <MobileLayout
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
            <div className="relative">
              <input
                type="text"
                placeholder={t("account.customerInfo.addressPlaceholder")}
                value={address}
                onChange={(event) => setCustomerInfo(event.target.value, addressDetail)}
                className="w-full pl-4 pr-12 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                style={{ fontSize: "16px" }}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Search className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-foreground">
              {t("account.customerInfo.addressDetail")}
            </label>
            <input
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
    </MobileLayout>
  );
}
