import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react'
import { AppButton } from '../design-system/AppButton'
import { ConsentDefinition, getRequiredTermIds } from '../../domains/certificate-consent/spec'
import {
  getAgreedTermIds,
  getOpenCategoryIds,
  resetConsentStorage,
  setAgreedTermIds,
  setCategoryCursor,
  setOpenCategoryIds,
} from '../../domains/certificate-consent/storage'

interface ConsentOverviewAccordionProps {
  definition: ConsentDefinition
  preserveState: boolean
  basePath?: string
  preserveStateKey?: string
  resetCarouselCursorKey?: string
  title?: string
  description?: string
  showSelectionControls?: boolean
  onRequiredCompleteChange?: (complete: boolean) => void
}

export function ConsentOverviewAccordion({
  definition,
  preserveState,
  basePath = '/consent-template',
  preserveStateKey = 'preserveConsentState',
  resetCarouselCursorKey = 'resetCategoryCursor',
  title = '서비스를 가입을 위해\n약관에 동의해 주세요',
  description = '약관 동의 샘플 페이지',
  showSelectionControls = true,
  onRequiredCompleteChange,
}: ConsentOverviewAccordionProps) {
  const navigate = useNavigate()
  const [openCategoryIds, setOpenCategoryIdsState] = useState<string[]>(() => {
    const saved = getOpenCategoryIds()
    if (saved.length > 0) return saved
    return definition.categories
      .filter((category) => category.required)
      .map((category) => category.id)
  })
  const [checkedTermIds, setCheckedTermIds] = useState<Set<string>>(() => getAgreedTermIds())

  const titleLines = title.split('\n')
  const requiredIds = useMemo(() => getRequiredTermIds(definition), [definition])
  const isRequiredComplete = requiredIds.every((id) => checkedTermIds.has(id))

  useEffect(() => {
    onRequiredCompleteChange?.(isRequiredComplete)
  }, [isRequiredComplete, onRequiredCompleteChange])

  useEffect(() => {
    if (preserveState) return
    resetConsentStorage()
    const initialOpenCategoryIds = definition.categories
      .filter((category) => category.required)
      .map((category) => category.id)
    setOpenCategoryIdsState(initialOpenCategoryIds)
    setCheckedTermIds(new Set())
  }, [definition.categories, preserveState])

  useEffect(() => {
    setOpenCategoryIds(openCategoryIds)
  }, [openCategoryIds])

  const toggleCategory = (categoryId: string) => {
    setOpenCategoryIdsState((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    )
  }

  const handleCategoryCheckClick = (categoryId: string) => {
    if (!showSelectionControls) return
    const category = definition.categories.find((item) => item.id === categoryId)
    if (!category) return
    const termIds = category.terms.map((term) => term.id)
    const isAllChecked = termIds.every((id) => checkedTermIds.has(id))

    if (isAllChecked) {
      setCheckedTermIds((prev) => {
        const next = new Set(prev)
        termIds.forEach((id) => next.delete(id))
        setAgreedTermIds(next)
        return next
      })
      return
    }

    setCategoryCursor(categoryId, 0)
    navigate(`${basePath}/categories/${categoryId}/consent`, {
      state: { [preserveStateKey]: true, [resetCarouselCursorKey]: true },
    })
  }

  const handleTermCheckClick = (termId: string) => {
    if (!showSelectionControls) return
    if (checkedTermIds.has(termId)) {
      setCheckedTermIds((prev) => {
        const next = new Set(prev)
        next.delete(termId)
        setAgreedTermIds(next)
        return next
      })
      return
    }
    navigate(`${basePath}/terms/${termId}`, { state: { [preserveStateKey]: true } })
  }

  return (
    <div className="space-y-4 pb-2">
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold leading-tight">
          {titleLines.map((line, idx) => (
            <span key={`${line}-${idx}`}>
              {line}
              {idx < titleLines.length - 1 && <br />}
            </span>
          ))}
        </h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </section>

      <section className="space-y-3">
        {definition.categories.map((category) => {
          const isOpen = openCategoryIds.includes(category.id)
          const isCategoryAllChecked = category.terms.every((term) => checkedTermIds.has(term.id))

          return (
            <div key={category.id} className="rounded-2xl bg-secondary p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <AppButton
                    variant="unstyled"
                    onClick={() => handleCategoryCheckClick(category.id)}
                    className="p-1"
                  >
                    <CheckCircle2
                      className={`w-5 h-5 ${isCategoryAllChecked ? 'text-blue-600 fill-blue-100' : 'text-muted-foreground'}`}
                    />
                  </AppButton>
                  <AppButton
                    variant="unstyled"
                    onClick={() => toggleCategory(category.id)}
                    className="flex-1 text-left py-1"
                  >
                    <span className="font-medium">{category.title}</span>
                  </AppButton>
                </div>
                <AppButton
                  variant="unstyled"
                  onClick={() => toggleCategory(category.id)}
                  className="p-1"
                >
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </AppButton>
              </div>

              {isOpen && (
                <div className="mt-3 border-t border-border pt-2 space-y-1">
                  {category.terms.map((term) => (
                    <div key={term.id} className="flex items-center gap-2 py-2">
                      <AppButton
                        variant="unstyled"
                        onClick={() => handleTermCheckClick(term.id)}
                        className="p-1"
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${checkedTermIds.has(term.id) ? 'text-blue-600 fill-blue-100' : 'text-muted-foreground'}`}
                        />
                      </AppButton>
                      <AppButton
                        variant="unstyled"
                        onClick={() =>
                          navigate(`${basePath}/terms/${term.id}`, {
                            state: { [preserveStateKey]: true },
                          })
                        }
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="text-sm">{term.title}</p>
                        <p className="text-xs text-muted-foreground">{term.summary}</p>
                      </AppButton>
                      <AppButton
                        variant="unstyled"
                        onClick={() =>
                          navigate(`${basePath}/terms/${term.id}`, {
                            state: { [preserveStateKey]: true },
                          })
                        }
                        className="p-1"
                      >
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </AppButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </section>
    </div>
  )
}
