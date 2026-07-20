import imBankLogoSource from './assets/im-bank-logo-source.png'

export function DemoHeaderBrand() {
  return (
    <div className="relative h-7 w-[112px] shrink-0 overflow-hidden" aria-label="iM뱅크">
      <img
        src={imBankLogoSource}
        alt="iM뱅크"
        className="pointer-events-none absolute left-[-14px] top-[-14px] w-[140px] max-w-none"
      />
    </div>
  )
}
