import { AppButton } from '../../components/design-system/AppButton'
import jobBannerImg from './assets/job-banner.png'

interface MainJobBannerProps {
  onClick?: () => void
}

export function MainJobBanner({ onClick }: MainJobBannerProps) {
  return (
    <AppButton
      type="button"
      variant="unstyled"
      onClick={onClick}
      className="block w-full overflow-hidden rounded-2xl text-left"
    >
      <div className="relative h-40 overflow-hidden rounded-2xl border border-primary-light/20 bg-primary-soft p-6 shadow-[0_3px_12px_rgba(15,23,42,0.045)] max-[350px]:h-[220px]">
        <div className="relative z-10 max-w-[180px] max-[350px]:max-w-none">
          <h3 className="mb-8 text-lg font-semibold text-primary max-[350px]:mb-4">구인구직 정보</h3>
          <p className="whitespace-pre-line text-sm font-medium leading-5 text-foreground">
            외국인 맞춤 일자리를
            <br />
            쉽고 빠르게 찾아보세요
          </p>
        </div>

        <img
          src={jobBannerImg}
          alt="구인구직"
          className="absolute bottom-2 right-0 h-[125px] object-contain pointer-events-none max-[350px]:bottom-3 max-[350px]:right-3 max-[350px]:h-[105px]"
        />
      </div>
    </AppButton>
  )
}
