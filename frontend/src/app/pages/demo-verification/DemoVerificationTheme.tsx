import type { CSSProperties } from 'react'
import { Outlet } from 'react-router-dom'

type ThemeProperties = CSSProperties & Record<`--${string}`, string>

const demoTheme: ThemeProperties = {
  '--primary': '#00C7A9',
  '--primary-dark': '#00A88F',
  '--primary-light': '#4ADBC5',
  '--primary-soft': '#E7FBF7',
  '--primary-foreground': '#063D35',
  '--secondary': '#F0F8F5',
  '--secondary-foreground': '#173D36',
  '--muted': '#F7FBF9',
  '--muted-foreground': '#647873',
  '--accent': '#E2F15E',
  '--accent-foreground': '#293200',
  '--border': '#D7E9E4',
  '--ring': '#00C7A9',
  '--success-visual-outer': '#E7FBF7',
  '--success-visual-inner': '#C9F5ED',
  '--success-visual-check': '#00A88F',
}

export function DemoVerificationTheme() {
  return (
    <div className="h-full w-full" style={demoTheme}>
      <Outlet />
    </div>
  )
}
