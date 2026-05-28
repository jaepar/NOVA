import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface ConsentStorageState {
  agreedTermIds: string[]
  openCategoryIds: string[]
  categoryCursor: Record<string, number>
  setAgreedTermIds: (termIds: string[]) => void
  setOpenCategoryIds: (categoryIds: string[]) => void
  setCategoryCursor: (categoryId: string, index: number) => void
  reset: () => void
}

export const useConsentStorageStore = create<ConsentStorageState>()(
  persist(
    (set) => ({
      agreedTermIds: [],
      openCategoryIds: [],
      categoryCursor: {},
      setAgreedTermIds: (termIds) => set({ agreedTermIds: termIds }),
      setOpenCategoryIds: (categoryIds) => set({ openCategoryIds: categoryIds }),
      setCategoryCursor: (categoryId, index) =>
        set((state) => ({
          categoryCursor: {
            ...state.categoryCursor,
            [categoryId]: Math.max(0, Math.floor(index)),
          },
        })),
      reset: () =>
        set({
          agreedTermIds: [],
          openCategoryIds: [],
          categoryCursor: {},
        }),
    }),
    {
      name: 'certificate-consent-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export function getAgreedTermIds() {
  return new Set(useConsentStorageStore.getState().agreedTermIds)
}

export function setAgreedTermIds(termIds: Set<string>) {
  useConsentStorageStore.getState().setAgreedTermIds(Array.from(termIds))
}

export function markTermAgreed(termId: string) {
  const next = getAgreedTermIds()
  next.add(termId)
  setAgreedTermIds(next)
}

export function markTermsAgreed(termIds: string[]) {
  const next = getAgreedTermIds()
  termIds.forEach((termId) => next.add(termId))
  setAgreedTermIds(next)
}

export function unmarkTermAgreed(termId: string) {
  const next = getAgreedTermIds()
  next.delete(termId)
  setAgreedTermIds(next)
}

export function getOpenCategoryIds() {
  return useConsentStorageStore.getState().openCategoryIds
}

export function setOpenCategoryIds(categoryIds: string[]) {
  useConsentStorageStore.getState().setOpenCategoryIds(categoryIds)
}

export function getCategoryCursor(categoryId: string) {
  const value = useConsentStorageStore.getState().categoryCursor[categoryId]
  if (typeof value !== 'number' || value < 0) return 0
  return Math.floor(value)
}

export function setCategoryCursor(categoryId: string, index: number) {
  useConsentStorageStore.getState().setCategoryCursor(categoryId, index)
}

export function resetConsentStorage() {
  useConsentStorageStore.getState().reset()
}
