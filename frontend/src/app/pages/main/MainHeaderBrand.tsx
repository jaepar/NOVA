import headerBrandIcon from './assets/header-brand-icon.png'
import headerBrandWordmark from './assets/header-brand-wordmark.png'

export function MainHeaderBrand() {
  return (
    <div className="flex w-max shrink-0 items-center gap-3">
      <img src={headerBrandIcon} alt="" className="h-8 w-8 shrink-0 object-contain" />
      <img src={headerBrandWordmark} alt="NOVA" className="h-[18px] w-auto shrink-0 object-contain" />
    </div>
  )
}
