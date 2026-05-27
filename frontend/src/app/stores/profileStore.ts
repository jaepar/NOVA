import { create } from 'zustand'

export type PortfolioFileType = 'pdf' | 'docx' | 'pptx'

export interface PortfolioItem {
  name: string
  date: string
  type: PortfolioFileType
}

interface ProfileInfo {
  name: string
  email: string
  birthDate: string
  gender: string
  languageId: string
  hasCertificate: string
  hasForeignerCard: string
}

interface ProfileState {
  profile: ProfileInfo
  portfolios: PortfolioItem[]
  updateProfile: (payload: { languageId: string; portfolios: PortfolioItem[] }) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: {
    name: '김민정',
    email: 'minjeong@email.com',
    birthDate: '2000.05.20',
    gender: '여성',
    languageId: 'ko',
    hasCertificate: '보유',
    hasForeignerCard: '보유',
  },
  portfolios: [
    { name: '간호사_이력서.pdf', date: '2024.06.01', type: 'pdf' },
    { name: '자기소개서.docx', date: '2024.06.01', type: 'docx' },
    { name: '포트폴리오_작품집.pptx', date: '2024.06.02', type: 'pptx' },
    { name: '자격증_사본.pdf', date: '2024.06.03', type: 'pdf' },
    { name: '봉사활동_확인서.docx', date: '2024.06.04', type: 'docx' },
  ],
  updateProfile: ({ languageId, portfolios }) =>
    set((state) => ({
      profile: {
        ...state.profile,
        languageId,
      },
      portfolios,
    })),
}))
