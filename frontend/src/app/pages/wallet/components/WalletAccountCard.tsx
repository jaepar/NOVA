import { ChevronRight } from 'lucide-react'
import { AppButton } from '../../../components/design-system/AppButton'

export function WalletAccountCard() {
  return (
    <section className="rounded-[14px] border border-[#e4e4e4] bg-white px-5 py-5">
      <h2 className="text-[18px] font-semibold leading-7 text-[#111111]">출금 계좌</h2>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#0078c8]">
            <div className="absolute left-[-10px] top-[20px] h-4 w-16 -rotate-12 rounded-full bg-white/90" />
            <div className="absolute left-[-8px] top-[27px] h-4 w-16 -rotate-12 rounded-full bg-[#5ab5e8]" />
          </div>

          <div className="min-w-0">
            <p className="text-[16px] font-medium leading-6 text-[#111111]">우리은행</p>
            <p className="truncate text-[14px] leading-5 text-[#999999]">우리 1002-****-5678</p>
          </div>
        </div>

        <AppButton
          type="button"
          variant="unstyled"
          className="flex shrink-0 items-center gap-2 text-[15px] font-semibold text-[#111111]"
        >
          변경
          <ChevronRight className="h-4 w-4" />
        </AppButton>
      </div>
    </section>
  )
}
