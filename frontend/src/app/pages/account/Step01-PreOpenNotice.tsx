import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { useTranslation } from "../../i18n";

const noticeCards = [
  {
    id: "id-card",
    titleKey: "account.preOpen.idTitle",
    descriptionKey: "account.preOpen.idDescription",
  },
  {
    id: "recent-account",
    titleKey: "account.preOpen.recentTitle",
    descriptionKey: "account.preOpen.recentDescription",
  },
  {
    id: "limit",
    titleKey: "account.preOpen.limitTitle",
    descriptionKey: "account.preOpen.limitDescription",
  },
] as const;

function MultilineText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, index, lines) => (
        <span key={`${line}-${index}`}>
          {line}
          {index < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

export function Step01PreOpenNotice() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <MobileLayout
      title={t("account.openingHeader")}
      titleKey="account.openingHeader"
      bottomContent={
        <Btn_1Col onClick={() => navigate("/account/step-02")}>
          {t("account.next")}
        </Btn_1Col>
      }
    >
      <div className="space-y-6 pb-2">
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold leading-tight">
            <MultilineText
              text={t("account.preOpen.heading")}
            />
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("account.preOpen.description")}
          </p>
        </section>

        <section className="space-y-3">
          {noticeCards.map((card) => (
            <article key={card.id} className="rounded-2xl bg-secondary p-4">
              <div className="flex gap-3">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t(card.titleKey)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t(card.descriptionKey)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </MobileLayout>
  );
}
