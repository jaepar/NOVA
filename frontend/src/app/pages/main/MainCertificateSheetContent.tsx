import { Btn_2Col } from '../../components/design-system/Btn_2Col'
import { useTranslation } from '../../i18n'

interface MainCertificateSheetContentProps {
  onLaterClick: () => void
  onIssueClick: () => void
}

export function MainCertificateSheetContent({
  onLaterClick,
  onIssueClick,
}: MainCertificateSheetContentProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-8 pb-2">
      <div className="space-y-4 text-center">
        <h3 className="whitespace-pre-line text-xl font-semibold leading-snug">
          {t('main.certificateSheetTitle')}
        </h3>
        <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
          {t('main.certificateSheetDescription')}
        </p>
      </div>

      <Btn_2Col
        leftLabel={t('main.later')}
        rightLabel={t('main.issue')}
        onLeftClick={onLaterClick}
        onRightClick={onIssueClick}
      />
    </div>
  )
}
