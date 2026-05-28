import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { authApi } from '../api'
import { router } from './routes'
import { useMainPageStore } from './stores/pageStores'

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
    return null
  }

  return <RouterProvider router={router} />
}
