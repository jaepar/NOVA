import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children?: React.ReactNode
  bottomAction?: React.ReactNode
  height?: string
  disableScroll?: boolean
  dimBackground?: boolean
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  bottomAction,
  height,
  disableScroll = false,
  dimBackground = true,
}: BottomSheetProps) {
  const visibilityStore = useMemo(
    () =>
      createStore<{ isVisible: boolean; setIsVisible: (next: boolean) => void }>((set) => ({
        isVisible: false,
        setIsVisible: (next) => set({ isVisible: next }),
      })),
    []
  )
  const isVisible = useStore(visibilityStore, (state) => state.isVisible)
  const setIsVisible = useStore(visibilityStore, (state) => state.setIsVisible)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      document.body.style.overflow = 'hidden'
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      document.body.style.overflow = ''
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (!isVisible) return null

  const content = (
    <div
      className="fixed left-1/2 top-1/2 z-[60] h-[var(--app-height)] w-[var(--app-width)]"
      style={{
        transform: 'translate(-50%, -50%) scale(var(--app-scale))',
        transformOrigin: 'center center',
      }}
    >
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-300 ${
          dimBackground ? 'bg-black/50' : 'bg-transparent'
        } ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        className={`absolute bottom-0 left-0 right-0 z-10 bg-[rgb(253,253,253)] rounded-t-3xl w-full transition-transform duration-300 ease-out flex flex-col overflow-hidden ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          height: height || 'auto',
          maxHeight: '80%',
        }}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-border rounded-full"></div>
        </div>

        {title && (
          <div className="px-5 py-2">
            <h3>{title}</h3>
          </div>
        )}

        <div
          className={`flex-1 px-5 py-6 ${disableScroll ? 'overflow-hidden' : 'overflow-y-auto'}`}
        >
          {children}
        </div>

        {bottomAction && (
          <div className="px-5 pb-5">
            <div
              className="bg-background/95 backdrop-blur-[20px] p-4 rounded-2xl border border-border/50"
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              {bottomAction}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
