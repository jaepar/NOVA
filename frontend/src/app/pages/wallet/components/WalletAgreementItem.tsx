import { Check, ChevronRight } from 'lucide-react'
import { AppButton } from '../../../components/design-system/AppButton'
import type { WalletTerm } from '../data/walletTerms'

interface WalletAgreementItemProps {
  term: WalletTerm
  checked: boolean
  expanded: boolean
  showDivider: boolean
  onToggleCheck: () => void
  onToggleExpanded: () => void
}

export function WalletAgreementItem({
  term,
  checked,
  expanded,
  showDivider,
  onToggleCheck,
  onToggleExpanded,
}: WalletAgreementItemProps) {
  return (
    <section className={showDivider ? 'border-b border-border' : ''}>
      <div className="flex min-h-[58px] items-center gap-2 px-3">
        <AppButton
          type="button"
          variant="unstyled"
          aria-label={`${term.title} 동의`}
          aria-pressed={checked}
          onClick={onToggleCheck}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
            checked
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-gray-300 bg-background text-transparent'
          }`}
        >
          <Check className="h-3.5 w-3.5" />
        </AppButton>

        {term.required && (
          <span className="shrink-0 rounded-md bg-blue-50 px-1.5 py-1 text-[12px] font-medium leading-none text-primary">
            필수
          </span>
        )}

        <AppButton
          type="button"
          variant="unstyled"
          onClick={onToggleExpanded}
          className="flex min-w-0 flex-1 items-center justify-between gap-1 py-2 text-left"
        >
          <span className="min-w-0 flex-1 whitespace-nowrap text-[12px] font-semibold leading-5 text-foreground">
            {term.title}
          </span>
          <ChevronRight
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
              expanded ? 'rotate-90' : ''
            }`}
          />
        </AppButton>
      </div>

      {expanded && (
        <div className="px-4 pb-5">
          <div className="max-h-52 overflow-y-auto rounded-xl border border-border bg-muted p-4">
            <div className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {term.content}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
