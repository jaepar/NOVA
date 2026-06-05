import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { AppButton } from '../../../components/design-system/AppButton'
import type { AccountInfo } from '../types'
import { formatWon } from '../utils'
import wooriBankLogo from '../assets/woori-bank-logo.png'

interface AccountSummaryCardProps {
  account: AccountInfo
  onTransferClick: () => void
}

export function AccountSummaryCard({ account, onTransferClick }: AccountSummaryCardProps) {
  const handleCopyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(account.number)
      toast.success('계좌번호를 복사했어요.')
    } catch {
      toast.error('계좌번호 복사에 실패했어요.')
    }
  }

  return (
    <section className="px-5 pb-5 pt-2">
      {account.isLimited && (
        <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-[12px] font-medium leading-none text-foreground">
          한도제한
        </span>
      )}

      <div className="mt-5 flex items-start gap-3">
        <img src={wooriBankLogo} alt="우리은행 로고" className="h-10 w-10 shrink-0 rounded-full object-cover" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-semibold leading-6 text-foreground">{account.name}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <p className="truncate text-[14px] font-medium leading-5 text-muted-foreground">
              {account.number}
            </p>
            <AppButton
              variant="unstyled"
              onClick={handleCopyAccountNumber}
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary"
            >
              <Copy className="h-3.5 w-3.5" />
            </AppButton>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-end">
        <p className="text-[26px] font-bold leading-8 text-foreground">{formatWon(account.balance)}</p>
        <p className="mt-1 text-[12px] font-medium leading-4 text-muted-foreground">
          출금가능금액 {formatWon(account.availableBalance)}
        </p>
        <AppButton
          variant="primary"
          onClick={onTransferClick}
          className="mt-4 h-[42px] w-[116px] rounded-lg text-[15px] font-semibold"
        >
          이체
        </AppButton>
      </div>
    </section>
  )
}
