import type { RouteObject } from 'react-router-dom'
import { Profile } from '../pages/profile/Profile'
import { ProfileEdit } from '../pages/profile/ProfileEdit'

export const profileRoutes: RouteObject[] = [
  { path: '/mypage', Component: Profile },
  { path: '/mypage/edit', Component: ProfileEdit },
]
