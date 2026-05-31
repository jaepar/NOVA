import type { RouteObject } from 'react-router-dom'
import { JobApplications } from '../pages/job/JobApplications'
import { JobApply } from '../pages/job/JobApply'
import { JobDetail } from '../pages/job/JobDetail'
import { JobList } from '../pages/job/JobList'

export const jobRoutes: RouteObject[] = [
  { path: '/jobs', Component: JobList },
  { path: '/jobs/applications', Component: JobApplications },
  { path: '/jobs/:jobId', Component: JobDetail },
  { path: '/jobs/:jobId/apply', Component: JobApply },
]
