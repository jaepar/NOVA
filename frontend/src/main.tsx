import { createRoot } from 'react-dom/client'
import App from './app/App.tsx'
import './styles/index.css'

const APP_WIDTH = 390
const APP_HEIGHT = 844
const MOBILE_BREAKPOINT = 768
const MIN_APP_WIDTH = 344

function updateAppScale() {
  const viewportWidth = window.visualViewport?.width ?? window.innerWidth
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight
  const isMobileViewport = window.matchMedia(
    `(max-width: ${MOBILE_BREAKPOINT}px)`,
  ).matches

  if (isMobileViewport) {
    document.documentElement.style.setProperty('--app-width', `${Math.max(viewportWidth, MIN_APP_WIDTH)}px`)
    document.documentElement.style.setProperty('--app-height', `${viewportHeight}px`)
    document.documentElement.style.setProperty('--app-scale', '1')
    return
  }

  const widthScale = viewportWidth / APP_WIDTH
  const heightScale = viewportHeight / APP_HEIGHT
  const scale = Math.max(Math.min(widthScale, heightScale, 1), MIN_APP_WIDTH / APP_WIDTH)

  document.documentElement.style.setProperty('--app-width', `${APP_WIDTH}px`)
  document.documentElement.style.setProperty('--app-height', `${APP_HEIGHT}px`)
  document.documentElement.style.setProperty('--app-scale', String(scale))
}

updateAppScale()
window.addEventListener('resize', updateAppScale)
window.visualViewport?.addEventListener('resize', updateAppScale)

createRoot(document.getElementById('root')!).render(<App />)
