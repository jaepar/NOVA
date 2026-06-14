import wooriBankLogo from "../assets/woori-bank-logo.png";
import wooriBankLogoWebp from "../assets/woori-bank-logo.webp";

interface WalletAccountCardProps {
  accountNumber?: string | null;
}

export function WalletAccountCard({ accountNumber }: WalletAccountCardProps) {
  return (
    <section className="rounded-[14px] border border-[#e4e4e4] bg-white px-5 py-5">
      <h2 className="text-[18px] font-semibold leading-7 text-[#111111]">출금 계좌</h2>

      <div className="mt-8 flex min-w-0 items-center gap-3">
        <picture>
          <source srcSet={wooriBankLogoWebp} type="image/webp" />
          <img
            src={wooriBankLogo}
            alt=""
            aria-hidden="true"
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        </picture>

        <div className="min-w-0">
          <p className="text-[16px] font-medium leading-6 text-[#111111]">우리은행</p>
          <p className="truncate text-[14px] leading-5 text-[#999999]">
            {accountNumber ?? "계좌 정보를 불러오는 중"}
          </p>
        </div>
      </div>
    </section>
  );
}
