import { create } from 'zustand'
import type { UserProfileResponse } from '../../api'
import { getLanguageCookie as getStoredLanguageCookie } from '../i18n'

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

function normalizeGender(gender: string): string {
  switch (gender.toUpperCase()) {
    case 'MALE':
    case 'M':
      return 'male'
    case 'FEMALE':
    case 'F':
      return 'female'
    default:
      return gender || '-'
  }
}

function normalizeCertificateStatus(status: string): string {
  switch (status.toUpperCase()) {
    case 'ISSUED':
    case 'ACTIVE':
      return 'owned'
    case 'NONE':
    case 'NOT_ISSUED':
      return 'notOwned'
    case 'PENDING':
    case 'REQUESTED':
      return 'pending'
    default:
      return status || '-'
  }
}

function normalizeBooleanStatus(value: boolean): string {
  return value ? 'owned' : 'notOwned'
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
  setProfileFromResponse: (payload, languageId = getStoredLanguageCookie()) =>
    set({
      profile: {
        name: payload.name,
        email: payload.email,
        birthDate: formatBirthDate(payload.birth),
        gender: normalizeGender(payload.gender),
        languageId,
        hasCertificate: normalizeCertificateStatus(payload.certificateStatus),
        hasForeignerCard: normalizeBooleanStatus(payload.hasResidenceCard),
      },
      portfolios: payload.portfolios.map((portfolio) => ({
        portfolioId: portfolio.portfolioId,
        name: portfolio.name,
        date: '',
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
