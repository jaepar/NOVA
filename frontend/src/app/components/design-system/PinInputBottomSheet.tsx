import { useEffect, useMemo, useState } from 'react'
import { Delete } from 'lucide-react'
import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'
import { BottomSheet } from '../layout/BottomSheet'
import { AppButton } from './AppButton'
import { useTranslation } from '../../i18n'

interface PinInputBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  pinLength?: number
  onComplete?: (pin: string) => void
}

export function PinInputBottomSheet({
  isOpen,
  onClose,
  title,
  pinLength = 4,
  onComplete,
}: PinInputBottomSheetProps) {
  const { t } = useTranslation()
  const resolvedTitle = title ?? t('common.accountPassword')
  const pinStore = useMemo(
    () =>
      createStore<{ pin: string; setPin: (next: string) => void }>((set) => ({
        pin: '',
        setPin: (next) => set({ pin: next }),
      })),
    []
  )
  const pin = useStore(pinStore, (state) => state.pin)
  const setPin = useStore(pinStore, (state) => state.setPin)
  const [shuffledDigits, setShuffledDigits] = useState<number[]>([])

  const shuffleDigits = () => {
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    for (let i = digits.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[digits[i], digits[j]] = [digits[j], digits[i]]
    }
    return digits
  }

  useEffect(() => {
    if (isOpen) {
      setPin('')
      setShuffledDigits(shuffleDigits())
    }
  }, [isOpen])

  useEffect(() => {
    if (pin.length === pinLength && onComplete) {
      onComplete(pin)
    }
  }, [pin, pinLength, onComplete])

  const handleNumberClick = (num: number) => {
    if (pin.length < pinLength) {
      setPin(pin + num)
    }
  }

  const handleDelete = () => setPin(pin.slice(0, -1))
  const numbers = shuffledDigits.length === 10 ? shuffledDigits : [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title=""
      height="520px"
      disableScroll={true}
    >
      <div className="space-y-5 overflow-hidden">
        <div className="min-h-[88px] flex flex-col items-center justify-center">
          <p className="text-center">{resolvedTitle}</p>
        </div>

        <div className="flex justify-center gap-3">
          {Array.from({ length: pinLength }).map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full border-2 transition-all ${
                index < pin.length ? 'bg-primary border-primary' : 'bg-transparent border-border'
              }`}
            />
          ))}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {numbers.slice(0, 9).map((num, index) => (
              <AppButton
                variant="unstyled"
                key={`${num}-${index}`}
                onClick={() => handleNumberClick(num)}
                className="h-16 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 transition-colors active:scale-95"
              >
                <span className="text-2xl">{num}</span>
              </AppButton>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 rounded-xl bg-secondary" />
            <AppButton
              variant="unstyled"
              onClick={() => handleNumberClick(numbers[9])}
              className="h-16 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 transition-colors active:scale-95"
            >
              <span className="text-2xl">{numbers[9]}</span>
            </AppButton>
            <AppButton
              variant="unstyled"
              onClick={handleDelete}
              className="h-16 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 transition-colors active:scale-95"
            >
              <Delete className="w-6 h-6" />
            </AppButton>
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}
