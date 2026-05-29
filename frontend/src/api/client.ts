import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// API Base URL - 환경변수로 관리 권장
const BASE_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_BASE_URL

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10초
  headers: {
    'Content-Type': 'application/json',
  },
})

function maskSensitiveData(data: unknown) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return data
  }

  const maskedData = { ...(data as Record<string, unknown>) }

  for (const key of Object.keys(maskedData)) {
    if (key.toLowerCase().includes('password')) {
      maskedData[key] = '[REDACTED]'
    }
  }

  return maskedData
}

// Request Interceptor - 요청 전 처리
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 요청 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: maskSensitiveData(config.data),
      })
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response Interceptor - 응답 후 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 응답 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        status: response.status,
        data: response.data,
      })
    }

    return response
  },
  async (error: AxiosError) => {
    // 에러 처리
    if (error.response) {
      const status = error.response.status

      switch (status) {
        case 401:
          // 인증 실패 - 로그인 페이지로 리다이렉트
          console.error('Authentication failed')
          // TODO: 로그인 페이지로 리다이렉트
          // window.location.href = '/login';
          break

        case 403:
          // 권한 없음
          console.error('Access forbidden')
          break

        case 404:
          // 리소스 없음
          console.error('Resource not found')
          break

        case 500:
          // 서버 에러
          console.error('Server error')
          break

        default:
          console.error('API Error:', error.response.data)
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없음
      console.error('No response from server')
    } else {
      // 요청 설정 중 에러 발생
      console.error('Request setup error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default apiClient
