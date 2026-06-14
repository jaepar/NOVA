import type { RouteObject } from 'react-router-dom'
import { lazyComponent } from './lazyRoute'

export const loginRoutes: RouteObject[] = [
  { path: '/login', lazy: lazyComponent(() => import('../pages/login/LoginIntro'), 'LoginIntro') },
  { path: '/login/form', lazy: lazyComponent(() => import('../pages/login/LoginForm'), 'LoginForm') },
]
