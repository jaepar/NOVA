import type { CSSProperties } from 'react'
import { CheckCircle2 } from 'lucide-react'

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

export function CertificateIssuedAnimationStyles() {
  return (
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
  )
}

export function CertificateIssuedConfetti() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden">
      {confettiPieces.map((piece) => (
        <span
          key={piece.left}
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
  )
}

export function CertificateIssuedCheckMark() {
  return (
    <div
      className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary/10 text-primary"
      style={{
        animation: 'certificate-check-pop 520ms cubic-bezier(0.2, 0.85, 0.25, 1.25) 80ms both',
      }}
    >
      <CheckCircle2 className="h-11 w-11" strokeWidth={2.5} />
    </div>
  )
}
