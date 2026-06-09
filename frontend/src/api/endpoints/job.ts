import apiClient from '../client'

type ApiEnvelope<T> = {
  success: boolean
  code: string
  message: string
  data: T
}

export type JobOpeningItemResponse = {
  job_id: number
  company: string
  region: string
  opening_title: string
  job_category: string
  experience: string
  work_period: string
  salary: string
  created_at: string
}

export type JobOpeningListResponse = {
  items: JobOpeningItemResponse[]
  page: number
  size: number
  has_next: boolean
}

export type JobOpeningResponse = JobOpeningItemResponse & {
  deadline_type: string
  recruit_count: string
  preferred: string
  age: string
  gender: string
  job_role: string
  employment_type: string
  benefits: string
  address: string
  introduce: string
}

export type ApplicationFormPortfolioResponse = {
  portfolio_id: number
  name: string
  url: string
}

export type ApplicationFormResponse = {
  user_id: number
  name: string
  email: string
  portfolios: ApplicationFormPortfolioResponse[]
}

export type ApplicationStatus = 'PASSED' | 'FAILED' | 'UNREAD' | 'READ'

export type ApplicationItemResponse = {
  application_id: number
  job_id: number
  opening_title: string
  applied_at: string
  status: ApplicationStatus
}

export type ApplicationListResponse = {
  items: ApplicationItemResponse[]
  page: number
  size: number
  has_next: boolean
}

export type ApplicationPortfolioItemResponse = {
  name: string
  url: string
}

export type ApplicationPortfolioResponse = ApplicationPortfolioItemResponse[]

export type JobOpeningListParams = {
  page?: number
  size?: number
}

export const jobApi = {
  listOpenings: async (params: JobOpeningListParams = {}): Promise<JobOpeningListResponse> => {
    const response = await apiClient.get<ApiEnvelope<JobOpeningListResponse>>('/jobs', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 50,
      },
    })
    return response.data.data
  },

  getOpening: async (jobId: number): Promise<JobOpeningResponse> => {
    const response = await apiClient.get<ApiEnvelope<JobOpeningResponse>>(`/jobs/${jobId}`)
    return response.data.data
  },

  getApplicationForm: async (): Promise<ApplicationFormResponse> => {
    const response =
      await apiClient.get<ApiEnvelope<ApplicationFormResponse>>('/jobs/applications/form')
    return response.data.data
  },

  listApplications: async (
    params: JobOpeningListParams = {}
  ): Promise<ApplicationListResponse> => {
    const response = await apiClient.get<ApiEnvelope<ApplicationListResponse>>(
      '/jobs/applications',
      {
        params: {
          page: params.page ?? 0,
          size: params.size ?? 50,
        },
      }
    )
    return response.data.data
  },

  getApplicationPortfolio: async (
    applicationId: number
  ): Promise<ApplicationPortfolioResponse> => {
    const response = await apiClient.get<
      ApiEnvelope<ApplicationPortfolioResponse | ApplicationPortfolioItemResponse | null>
    >(
      `/jobs/applications/${applicationId}/portfolios`
    )
    const portfolios = response.data.data

    if (!portfolios) {
      return []
    }

    return Array.isArray(portfolios) ? portfolios : [portfolios]
  },

  submitApplication: async (
    jobId: number,
    payload: { portfolioUrls: string[]; files: File[] }
  ): Promise<void> => {
    const formData = new FormData()
    formData.append(
      'body',
      new Blob([JSON.stringify({ portfolio_urls: payload.portfolioUrls })], {
        type: 'application/json',
      })
    )
    payload.files.forEach((file) => formData.append('files', file))

    await apiClient.post<ApiEnvelope<null>>(`/jobs/${jobId}/applications`, formData)
  },
}
