export type JobRegion = 'ALL' | 'SEOUL' | 'BUSAN' | 'DAEGU' | 'INCHEON' | 'GWANGJU' | 'DAEJEON' | 'ULSAN' | 'GYEONGGI'

export type ApplicationStatus = 'PASSED' | 'FAILED' | 'UNREAD' | 'READ'

export interface JobPosting {
  jobId: number
  company: string
  region: Exclude<JobRegion, 'ALL'>
  openingTitle: string
  jobCategory: string
  experience: string
  employmentType: string
  salary: string
  workDays: string
  createdAt: string
}

export interface JobPostingDetail extends JobPosting {
  recruitCount: number
  preferred: string
  age: string
  gender: string
  jobRole: string
  workPeriod: string
  benefits: string
  address: string
  introduce: string
  responsibilities: string[]
  qualifications: string[]
  advantages: string[]
  notices: string[]
}

export interface PortfolioFile {
  fileId: number
  fileName: string
  fileType: 'RESUME' | 'PORTFOLIO'
  createdAt: string
  version: string
  pageCount: number
}

export interface JobApplication {
  applicationId: number
  jobId: number
  openingTitle: string
  status: ApplicationStatus
  company: string
  createdAt: string
  files: PortfolioFile[]
}
