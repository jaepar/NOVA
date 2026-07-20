import { create } from 'zustand'

type DemoCertificateStatus = 'NEED_CERTIFICATE' | 'CERTIFICATE_ISSUING'

interface DemoVerificationState {
  certificateStatus: DemoCertificateStatus
  startCertificateRequest: () => void
  markCertificateUnderReview: () => void
}

export const useDemoVerificationStore = create<DemoVerificationState>((set) => ({
  certificateStatus: 'NEED_CERTIFICATE',
  startCertificateRequest: () => set({ certificateStatus: 'NEED_CERTIFICATE' }),
  markCertificateUnderReview: () => set({ certificateStatus: 'CERTIFICATE_ISSUING' }),
}))
