interface WalletBalanceCardProps {
  balance: number | null
}

export function WalletBalanceCard({ balance }: WalletBalanceCardProps) {
  return (
    <section className="relative h-[200px] overflow-hidden rounded-xl border border-zinc-300 bg-zinc-950 p-5 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
      <div className="absolute inset-0 bg-[linear-gradient(112deg,#050505_0%,#080808_48%,#1d4ed8_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_20%,rgba(37,99,235,0.78)_0%,rgba(37,99,235,0.26)_34%,rgba(0,0,0,0)_58%)]" />
      <div className="absolute bottom-0 right-0 h-24 w-40 bg-blue-600/30 blur-2xl" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <p className="text-right text-[16px] font-medium text-white/85">Wallet Money</p>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[15px] font-medium text-white/75">월렛 잔액</p>
            <p className="mt-2 whitespace-nowrap text-[32px] font-semibold leading-none tracking-normal">
              {balance === null ? "-" : balance.toLocaleString('ko-KR')}
              <span className="ml-1 text-[18px]">원</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
