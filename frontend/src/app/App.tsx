import { lazy, Suspense, useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { authApi } from '../api/endpoints/auth'
import { Spinner } from './components/design-system/Spinner'
import { router } from './routes'
import { useMainPageStore } from './stores/pageStores'
import { completeOnboarding } from './utils/onboardingStorage'

const LazyNovaToast = lazy(async () => {
  const module = await import('./components/design-system/NovaToast')

  return { default: module.NovaToast }
})

function AppBootSplash() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <Spinner size="lg" />
    </div>
  )
}

export default function App() {
  const isAuthChecked = useMainPageStore((state) => state.isAuthChecked)
  const setAuthenticated = useMainPageStore((state) => state.setAuthenticated)
  const clearAuth = useMainPageStore((state) => state.clearAuth)

  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      try {
        const session = await authApi.me()

        if (isMounted) {
          setAuthenticated(session.userId)
          completeOnboarding()
        }
      } catch {
        if (isMounted) {
          clearAuth()
        }
      }
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [clearAuth, setAuthenticated])

  if (!isAuthChecked) {
    return <AppBootSplash />
  }

  return (
    <>
      <RouterProvider router={router} />
      <Suspense fallback={null}>
        <LazyNovaToast />
      </Suspense>
    </>
  )
}
