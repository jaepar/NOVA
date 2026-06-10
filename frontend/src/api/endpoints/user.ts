import apiClient from '../client'

type UserApiResponse<T> = {
  success: boolean
  code: string
  message: string
  data: T
}

export type UserProfilePortfolioResponse = {
  portfolioId: number
  name: string
  url: string
}

export type UserProfileResponse = {
  name: string
  email: string
  birth: string
  gender: string
  hasResidenceCard: boolean
  certificateStatus: string
  portfolios: UserProfilePortfolioResponse[]
}

export type UpdateUserRequestPayload = {
  language?: string
  currentPassword?: string
  newPassword?: string
  newPasswordConfirm?: string
  deletePortfolioId?: number
}

export type UpdateUserProfilePayload = {
  request?: UpdateUserRequestPayload
  portfolioFiles?: File[]
}

export type NotificationType =
  | 'SUPPLEMENT_DOCUMENT'
  | 'RESIDENCE_CARD_PERIOD'
  | 'CERTIFICATE_ISSUED'

export type NotificationResponse = {
  notificationId: number
  type: NotificationType
  content: string
  createdAt: string
}

function hasRequestPayload(request?: UpdateUserRequestPayload) {
  if (!request) return false

  return Object.values(request).some((value) => value !== undefined && value !== '')
}

export const userApi = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserApiResponse<UserProfileResponse>>('/users')

    return response.data.data
  },

  updateProfile: async ({
    request,
    portfolioFiles = [],
  }: UpdateUserProfilePayload): Promise<void> => {
    const formData = new FormData()

    if (hasRequestPayload(request)) {
      formData.append(
        'request',
        new Blob([JSON.stringify(request)], {
          type: 'application/json',
        })
      )
    }

    portfolioFiles.forEach((file) => formData.append('portfolioFiles', file))

    await apiClient.patch<UserApiResponse<null>>('/users', formData)
  },

  getNotifications: async (): Promise<NotificationResponse[]> => {
    const response = await apiClient.get<UserApiResponse<NotificationResponse[]>>(
      '/users/notifications'
    )

    return response.data.data
  },
}
