import { useTranslation } from '../../../i18n'

export function AccountContinueHint() {
  const { t } = useTranslation()

  return (
    <div className="mt-5 flex items-center justify-center gap-3 text-[15px] font-semibold text-[#59606A]">
      <span>{t('transfer.continueHint')}</span>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className="h-2.5 w-2.5 rounded-full bg-[#006BFF] animate-transfer-bank-dot"
            style={{ animationDelay: `${index * 0.14}s` }}
          />
        ))}
      </div>
    </div>
  )
}
