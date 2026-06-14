import type { RouteObject } from 'react-router-dom'
import { lazyComponent } from './lazyRoute'

export const jobRoutes: RouteObject[] = [
  { path: '/jobs', lazy: lazyComponent(() => import('../pages/job/JobList'), 'JobList') },
  { path: '/jobs/applications', lazy: lazyComponent(() => import('../pages/job/JobApplications'), 'JobApplications') },
  { path: '/jobs/:jobId', lazy: lazyComponent(() => import('../pages/job/JobDetail'), 'JobDetail') },
  { path: '/jobs/:jobId/apply', lazy: lazyComponent(() => import('../pages/job/JobApply'), 'JobApply') },
]
