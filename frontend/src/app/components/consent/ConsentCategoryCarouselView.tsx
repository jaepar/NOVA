import { useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CloseButtonTemplate } from '../../pages/common/CloseButtonTemplate'
import { AppButton } from '../design-system/AppButton'
import { ConsentDefinition, findCategory } from '../../domains/spec'
import {
  markTermsAgreed,
  setCategoryCursor,
  useConsentStorageStore,
} from '../../domains/storage'

interface ConsentCategoryCarouselViewProps {
  definition: ConsentDefinition
  categoryId?: string
  basePath?: string
  preserveStateKey?: string
  resetCarouselCursorKey?: string
  showSelectionControls?: boolean
}

export function ConsentCategoryCarouselView({
  definition,
  categoryId,
  basePath = '/consent-template',
  preserveStateKey = 'preserveConsentState',
  resetCarouselCursorKey = 'resetCategoryCursor',
  showSelectionControls = true,
}: ConsentCategoryCarouselViewProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const dragStartX = useRef<number | null>(null)
  const didApplyInitialReset = useRef(false)

  const category = useMemo(
    () => (categoryId ? findCategory(definition, categoryId) : null),
    [categoryId, definition]
  )
  const state = location.state as Record<string, boolean> | null

  useEffect(() => {
    if (!category) return
    if (state?.[resetCarouselCursorKey] && !didApplyInitialReset.current) {
      setCategoryCursor(category.id, 0)
      didApplyInitialReset.current = true
    }
  }, [category, resetCarouselCursorKey, state])

  if (!category) {
    return (
      <CloseButtonTemplate
        headerTitle="약관/동의서 상세"
        onClose={() => navigate(basePath, { state: { [preserveStateKey]: true } })}
      >
        <div className="pt-10 text-center">카테고리를 찾을 수 없습니다.</div>
      </CloseButtonTemplate>
    )
  }

  const cursor = useConsentStorageStore((store) => {
    const value = store.categoryCursor[category.id]
    if (typeof value !== 'number' || value < 0) return 0
    return Math.floor(value)
  })

  const total = category.terms.length
  const currentIndex = Math.min(total - 1, Math.max(0, cursor))
  const current = category.terms[currentIndex]

  const move = (delta: number) => {
    if (total <= 1) return
    const next = Math.min(total - 1, Math.max(0, currentIndex + delta))
    setCategoryCursor(category.id, next)
  }

  const onDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = event.clientX
  }

  const onUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return
    const diff = event.clientX - dragStartX.current
    dragStartX.current = null
    if (Math.abs(diff) < 40) return
    if (diff < 0) move(1)
    if (diff > 0) move(-1)
  }

  return (
    <CloseButtonTemplate
      headerTitle="약관/동의서 상세"
      onClose={() => navigate(basePath, { state: { [preserveStateKey]: true } })}
      showBottomButton={showSelectionControls}
      buttonText={total > 1 ? '모두 동의하기' : '동의하기'}
      onButtonClick={() => {
        markTermsAgreed(category.terms.map((term) => term.id))
        setCategoryCursor(category.id, 0)
        navigate(basePath, { state: { [preserveStateKey]: true } })
      }}
    >
      <div className="space-y-4 select-none" onPointerDown={onDown} onPointerUp={onUp}>
        {total > 1 && (
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} / {total}
          </p>
        )}
        <h2 className="text-xl font-semibold">{current.title}</h2>
        {current.content.map((p, i) => (
          <p key={`${current.id}-${i}`} className="text-sm text-foreground/90 leading-relaxed">
            {p}
          </p>
        ))}

        {total > 1 && (
          <>
            <AppButton
              variant="unstyled"
              onClick={() => move(-1)}
              disabled={currentIndex === 0}
              className="fixed left-3 top-1/2 -translate-y-1/2 z-50 w-9 h-9 rounded-full bg-background/95 border border-border shadow-sm flex items-center justify-center disabled:opacity-40"
            >
              <ChevronLeft className="w-5 h-5" />
            </AppButton>
            <AppButton
              variant="unstyled"
              onClick={() => move(1)}
              disabled={currentIndex === total - 1}
              className="fixed right-3 top-1/2 -translate-y-1/2 z-50 w-9 h-9 rounded-full bg-background/95 border border-border shadow-sm flex items-center justify-center disabled:opacity-40"
            >
              <ChevronRight className="w-5 h-5" />
            </AppButton>
          </>
        )}
      </div>
    </CloseButtonTemplate>
  )
}

