import { AppButton } from '../../components/design-system'
import { useTranslation } from '../../i18n'
import {
  CertificateIssuedAnimationStyles,
  CertificateIssuedCheckMark,
  CertificateIssuedConfetti,
} from './CertificateIssuedCelebration'

interface CertificateIssuedModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenAccount: () => void | Promise<void>
  isOpenAccountLoading?: boolean
}

export function CertificateIssuedModal({
  isOpen,
  onClose,
  onOpenAccount,
  isOpenAccountLoading = false,
}: CertificateIssuedModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-issued-title"
      className="fixed inset-0 z-[90] mx-auto flex h-full w-full max-w-[var(--app-width)] items-center justify-center bg-black/35 px-6"
    >
      <CertificateIssuedAnimationStyles />

      <div className="relative w-full overflow-hidden rounded-[24px] bg-white px-5 pb-5 pt-7 text-center shadow-[0_18px_50px_rgba(15,23,42,0.22)]">
        <CertificateIssuedConfetti />

        <div
          className="relative"
          style={{ animation: 'certificate-modal-rise 180ms ease-out both' }}
        >
          <CertificateIssuedCheckMark />

          <div className="mt-5 flex items-center justify-center text-primary">
            <span className="text-[13px] font-semibold">
              {t('main.certificateIssuedModal.badge')}
            </span>
          </div>

          <h2
            id="certificate-issued-title"
            className="mt-2 text-[22px] font-bold leading-[1.35] text-foreground"
          >
            {t('main.certificateIssuedModal.title')}
          </h2>

          <p className="mt-3 text-[15px] leading-[1.55] text-muted-foreground">
            {t('main.certificateIssuedModal.description')}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2.5">
            <AppButton
              variant="secondary"
              onClick={onClose}
              className="h-[52px] w-full rounded-xl text-[15px] font-semibold text-muted-foreground"
            >
              {t('common.confirm')}
            </AppButton>
            <AppButton
              variant="primary"
              onClick={onOpenAccount}
              disabled={isOpenAccountLoading}
              className="h-[52px] w-full rounded-xl text-[16px] font-semibold"
            >
              {t('main.openAccount')}
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  )
}
