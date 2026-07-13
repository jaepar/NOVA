import { Check } from 'lucide-react'

type DemoVerificationProgressProps = {
  currentStep: number
}

const totalStepCount = 5

export function DemoVerificationProgress({ currentStep }: DemoVerificationProgressProps) {
  return (
    <div
      className="mb-7 pt-1"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={totalStepCount}
      aria-valuenow={currentStep}
      aria-label={`인증 진행 단계 ${currentStep}/${totalStepCount}`}
    >
      <div className="flex items-center">
        {Array.from({ length: totalStepCount }, (_, index) => {
          const step = index + 1
          const isCompleted = step < currentStep
          const isCurrent = step === currentStep

          return (
            <div key={step} className="contents">
              <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                {isCompleted ? (
                  <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#aeb1c3] text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                ) : isCurrent ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {currentStep}
                  </span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-[#b8bac8]" />
                )}

                {isCurrent && (
                  <span className="absolute top-8 whitespace-nowrap text-xs font-semibold text-primary">
                    {currentStep}/{totalStepCount}
                  </span>
                )}
              </div>

              {step < totalStepCount && (
                <span
                  className={`h-[2px] min-w-0 flex-1 ${
                    step < currentStep ? 'bg-primary' : 'bg-[#b8bac8]'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-1 h-4 text-right text-xs font-medium text-[#a2a4b5]">
        {currentStep < totalStepCount ? `${totalStepCount}/${totalStepCount}` : null}
      </div>
    </div>
  )
}
