import type { RouteObject } from 'react-router-dom'
import { lazyComponent } from './lazyRoute'

export const signupRoutes: RouteObject[] = [
  { path: '/signup', lazy: lazyComponent(() => import('../pages/signup/EmailVerification'), 'EmailVerification') },
  { path: '/signup/personal-info', lazy: lazyComponent(() => import('../pages/signup/PersonalInfo'), 'PersonalInfo') },
  { path: '/signup/terms', lazy: lazyComponent(() => import('../pages/signup/Terms'), 'Terms') },
  { path: '/signup/terms/:termId', lazy: lazyComponent(() => import('../pages/signup/ConsentDetail'), 'ConsentDetail') },
  { path: '/signup/categories/:categoryId/consent', lazy: lazyComponent(() => import('../pages/signup/ConsentCategoryCarousel'), 'ConsentCategoryCarousel') },
  { path: '/signup/password', lazy: lazyComponent(() => import('../pages/signup/PasswordSetup'), 'PasswordSetup') },
  { path: '/signup/complete', lazy: lazyComponent(() => import('../pages/signup/Complete'), 'Complete') },
]
