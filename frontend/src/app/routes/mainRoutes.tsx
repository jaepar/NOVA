import type { RouteObject } from 'react-router-dom'
import { lazyComponent } from './lazyRoute'

export const mainRoutes: RouteObject[] = [
  { path: '/', lazy: lazyComponent(() => import('../pages/EntryRedirect'), 'EntryRedirect') },
  { path: '/home', lazy: lazyComponent(() => import('../pages/Home'), 'Home') },
  { path: '/language', lazy: lazyComponent(() => import('../pages/Language'), 'Language') },
  { path: '/landing', lazy: lazyComponent(() => import('../pages/Landing'), 'Landing') },
  { path: '/main', lazy: lazyComponent(() => import('../pages/Main'), 'Main') },
  { path: '/hospital-chat', lazy: lazyComponent(() => import('../pages/main/HospitalChatPage'), 'HospitalChatPage') },
  { path: '/exchange', lazy: lazyComponent(() => import('../pages/Exchange'), 'Exchange') },
  { path: '/notifications', lazy: lazyComponent(() => import('../pages/Notifications'), 'Notifications') },
  { path: '/design-system', lazy: lazyComponent(() => import('../pages/DesignSystem'), 'DesignSystem') },
]
