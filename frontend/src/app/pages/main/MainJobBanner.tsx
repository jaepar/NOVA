import { AppButton } from "../../components/design-system/AppButton";
import { useTranslation } from "../../i18n";
import jobBannerImg from "./assets/job-banner.png";

interface MainJobBannerProps {
  onClick?: () => void;
}

export function MainJobBanner({ onClick }: MainJobBannerProps) {
  const { t } = useTranslation();

  return (
    <AppButton
      type="button"
      variant="unstyled"
      onClick={onClick}
      className="block w-full overflow-hidden rounded-2xl text-left"
    >
      <div className="overflow-hidden rounded-2xl border border-primary-light/20 bg-primary-soft px-6 py-4 shadow-[0_3px_12px_rgba(15,23,42,0.045)]">
        <div className="flex min-h-[120px] items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="mb-4 text-lg font-semibold text-primary">
              {t("main.jobTitle")}
            </h3>
            <p className="whitespace-pre-line text-sm font-medium leading-5 text-foreground">
              {t("main.jobDescription")}
            </p>
          </div>

          <div className="flex w-[148px] shrink-0 items-end justify-end self-stretch">
            <img
              src={jobBannerImg}
              alt={t("main.jobTitle")}
              className="pointer-events-none h-[100px] w-full object-contain object-right-bottom"
            />
          </div>
        </div>
      </div>
    </AppButton>
  );
}
