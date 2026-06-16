import { Btn_2Col } from '../design-system/Btn_2Col'
import { useTranslation } from '../../i18n'

interface ResidenceCardRequiredSheetContentProps {
  onLaterClick: () => void
  onRegisterClick: () => void
}

export function ResidenceCardRequiredSheetContent({
  onLaterClick,
  onRegisterClick,
}: ResidenceCardRequiredSheetContentProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-8 pb-2">
      <div className="space-y-4 text-center">
        <h3 className="whitespace-pre-line text-xl font-semibold leading-snug">
          {t('main.residenceCardSheetTitle')}
        </h3>
        <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
          {t('main.residenceCardSheetDescription')}
        </p>
      </div>

      <Btn_2Col
        leftLabel={t('main.later')}
        rightLabel={t('main.registerResidenceCard')}
        onLeftClick={onLaterClick}
        onRightClick={onRegisterClick}
      />
    </div>
  )
}
