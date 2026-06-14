import axios from 'axios'

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T | null
  error: {
    code: string
    detail: string | null
  } | null
}

export type HospitalChatItem = Record<string, unknown>

export type HospitalChatData = {
  intent: string
  action_required: string
  hospital_id: number | null
  reservation_id: number | null
  requested_at: string | null
  confirmed_at: string | null
  suggested_slots: string[] | null
  reservation_status: string | null
  items: HospitalChatItem[] | null
}

export type HospitalChatPayload = {
  conversation_id: string
  message: string
  data: HospitalChatData | Record<string, unknown> | null
}

const defaultHospitalChatBaseUrl = import.meta.env.DEV
  ? '/ai-api'
  : import.meta.env.VITE_API_BASE_URL || 'https://api.nova-bank.site'
const hospitalChatBaseUrl =
  import.meta.env.VITE_AI_API_BASE_URL || defaultHospitalChatBaseUrl

const hospitalChatClient = axios.create({
  baseURL: hospitalChatBaseUrl,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const hospitalChatApi = {
  startSession: async (): Promise<HospitalChatPayload> => {
    const response = await hospitalChatClient.post<ApiEnvelope<HospitalChatPayload>>('/chat', {})
    return response.data.data as HospitalChatPayload
  },

  sendMessage: async (
    conversationId: string,
    message: string
  ): Promise<HospitalChatPayload> => {
    const response = await hospitalChatClient.post<ApiEnvelope<HospitalChatPayload>>(
      `/chat/${conversationId}`,
      { message }
    )
    return response.data.data as HospitalChatPayload
  },

  endSession: async (conversationId: string): Promise<HospitalChatPayload> => {
    const response = await hospitalChatClient.delete<ApiEnvelope<HospitalChatPayload>>(
      `/chat/${conversationId}`
    )
    return response.data.data as HospitalChatPayload
  },
}
