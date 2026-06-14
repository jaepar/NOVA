import type { RouteObject } from 'react-router-dom'
import { lazyComponent } from './lazyRoute'

export const profileRoutes: RouteObject[] = [
  { path: '/mypage', lazy: lazyComponent(() => import('../pages/profile/Profile'), 'Profile') },
  { path: '/mypage/edit', lazy: lazyComponent(() => import('../pages/profile/ProfileEdit'), 'ProfileEdit') },
]
