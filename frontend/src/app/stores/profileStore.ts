import { create } from 'zustand'
import type { UserProfileResponse } from '../../api'

export type PortfolioFileType = 'pdf' | 'docx' | 'file'

export interface PortfolioItem {
  portfolioId?: number
  name: string
  date: string
  type: PortfolioFileType
  url?: string
  file?: File
  isNew?: boolean
}

export interface ProfileInfo {
  name: string
  email: string
  birthDate: string
  gender: string
  languageId: string
  hasCertificate: string
  hasForeignerCard: string
}

interface ProfileState {
  profile: ProfileInfo | null
  portfolios: PortfolioItem[]
  isProfileLoaded: boolean
  setProfileFromResponse: (payload: UserProfileResponse, languageId?: string) => void
  setLanguage: (languageId: string) => void
  clearProfile: () => void
}

const DEFAULT_LANGUAGE_ID = 'ko'
const UNKNOWN_DATE_LABEL = '등록일 정보 없음'

function getLanguageCookie() {
  if (typeof document === 'undefined') return DEFAULT_LANGUAGE_ID

  const languageCookie = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('NOVA_LANGUAGE='))

  return languageCookie ? decodeURIComponent(languageCookie.split('=')[1]) : DEFAULT_LANGUAGE_ID
}

function inferPortfolioFileType(name: string, url?: string): PortfolioFileType {
  const target = `${name} ${url ?? ''}`.toLowerCase()

  if (target.includes('.pdf')) {
    return 'pdf'
  }

  if (target.includes('.docx')) {
    return 'docx'
  }

  return 'file'
}

function formatGender(gender: string) {
  switch (gender.toUpperCase()) {
    case 'MALE':
    case 'M':
      return '남성'
    case 'FEMALE':
    case 'F':
      return '여성'
    default:
      return gender || '-'
  }
}

function formatCertificateStatus(status: string) {
  switch (status.toUpperCase()) {
    case 'ISSUED':
    case 'ACTIVE':
      return '보유'
    case 'NONE':
    case 'NOT_ISSUED':
      return '미보유'
    case 'PENDING':
    case 'REQUESTED':
      return '발급 진행 중'
    default:
      return status || '-'
  }
}

function formatBooleanStatus(value: boolean) {
  return value ? '보유' : '미보유'
}

function formatBirthDate(birth: string) {
  const digits = birth.replace(/\D/g, '')

  if (digits.length === 8) {
    return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`
  }

  if (digits.length !== 6) {
    return birth || '-'
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 6)}`
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  portfolios: [],
  isProfileLoaded: false,
  setProfileFromResponse: (payload, languageId = getLanguageCookie()) =>
    set({
      profile: {
        name: payload.name,
        email: payload.email,
        birthDate: formatBirthDate(payload.birth),
        gender: formatGender(payload.gender),
        languageId,
        hasCertificate: formatCertificateStatus(payload.certificateStatus),
        hasForeignerCard: formatBooleanStatus(payload.hasResidenceCard),
      },
      portfolios: payload.portfolios.map((portfolio) => ({
        portfolioId: portfolio.portfolioId,
        name: portfolio.name,
        date: UNKNOWN_DATE_LABEL,
        type: inferPortfolioFileType(portfolio.name, portfolio.url),
        url: portfolio.url,
      })),
      isProfileLoaded: true,
    }),
  setLanguage: (languageId) =>
    set((state) => ({
      profile: state.profile
        ? {
            ...state.profile,
            languageId,
          }
        : state.profile,
    })),
  clearProfile: () => set({ profile: null, portfolios: [], isProfileLoaded: false }),
}))
