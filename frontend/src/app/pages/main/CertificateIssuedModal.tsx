import type { CSSProperties } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { AppButton } from '../../components/design-system'

interface CertificateIssuedModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenAccount: () => void
}

const confettiPieces = [
  { left: '12%', color: '#2563eb', delay: '0ms', drift: '-36px', rotate: '140deg' },
  { left: '22%', color: '#22c55e', delay: '70ms', drift: '-18px', rotate: '210deg' },
  { left: '34%', color: '#f59e0b', delay: '20ms', drift: '12px', rotate: '170deg' },
  { left: '46%', color: '#ef4444', delay: '110ms', drift: '-28px', rotate: '240deg' },
  { left: '58%', color: '#7c3aed', delay: '40ms', drift: '24px', rotate: '190deg' },
  { left: '70%', color: '#06b6d4', delay: '90ms', drift: '38px', rotate: '230deg' },
  { left: '82%', color: '#f97316', delay: '10ms', drift: '18px', rotate: '160deg' },
  { left: '28%', color: '#0ea5e9', delay: '150ms', drift: '-42px', rotate: '260deg' },
  { left: '64%', color: '#84cc16', delay: '145ms', drift: '44px', rotate: '250deg' },
]

export function CertificateIssuedModal({
  isOpen,
  onClose,
  onOpenAccount,
}: CertificateIssuedModalProps) {
  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-issued-title"
      className="fixed inset-0 z-[90] mx-auto flex h-full w-full max-w-[var(--app-width)] items-center justify-center bg-black/35 px-6"
    >
      <style>
        {`
          @keyframes certificate-confetti-fall {
            0% {
              opacity: 0;
              transform: translate3d(0, -96px, 0) rotate(0deg) scale(0.9);
            }
            12% {
              opacity: 1;
            }
            100% {
              opacity: 0;
              transform: translate3d(var(--confetti-drift), 128px, 0) rotate(var(--confetti-rotate)) scale(1);
            }
          }

          @keyframes certificate-modal-rise {
            0% {
              opacity: 0;
              transform: translateY(18px) scale(0.96);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes certificate-check-pop {
            0% {
              opacity: 0;
              transform: scale(0.58);
            }
            55% {
              opacity: 1;
              transform: scale(1.14);
            }
            78% {
              transform: scale(0.96);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>

      <div className="relative w-full overflow-hidden rounded-[24px] bg-white px-5 pb-5 pt-7 text-center shadow-[0_18px_50px_rgba(15,23,42,0.22)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden">
          {confettiPieces.map((piece, index) => (
            <span
              key={`${piece.left}-${index}`}
              className="absolute top-8 h-3 w-1.5 rounded-[2px]"
              style={
                {
                  left: piece.left,
                  backgroundColor: piece.color,
                  animation: `certificate-confetti-fall 1600ms ease-out ${piece.delay} both`,
                  '--confetti-drift': piece.drift,
                  '--confetti-rotate': piece.rotate,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div
          className="relative"
          style={{ animation: 'certificate-modal-rise 180ms ease-out both' }}
        >
          <div
            className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary/10 text-primary"
            style={{
              animation: 'certificate-check-pop 520ms cubic-bezier(0.2, 0.85, 0.25, 1.25) 80ms both',
            }}
          >
            <CheckCircle2 className="h-11 w-11" strokeWidth={2.5} />
          </div>

          <div className="mt-5 flex items-center justify-center text-primary">
            <span className="text-[13px] font-semibold">발급 완료</span>
          </div>

          <h2
            id="certificate-issued-title"
            className="mt-2 text-[22px] font-bold leading-[1.35] text-foreground"
          >
            인증서 발급이 완료되었습니다.
          </h2>

          <p className="mt-3 text-[15px] leading-[1.55] text-muted-foreground">
            이제 바로 계좌 개설을 시작할 수 있어요.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2.5">
            <AppButton
              variant="secondary"
              onClick={onClose}
              className="h-[52px] w-full rounded-xl text-[15px] font-semibold text-muted-foreground"
            >
              확인
            </AppButton>
            <AppButton
              variant="primary"
              onClick={onOpenAccount}
              className="h-[52px] w-full rounded-xl text-[16px] font-semibold"
            >
              계좌 개설하기
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  )
}
