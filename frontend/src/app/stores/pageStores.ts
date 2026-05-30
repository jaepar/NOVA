import { create } from 'zustand'

function clearSessionStorage() {
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') return

  window.sessionStorage.clear()
}

interface MainPageState {
  isMenuOpen: boolean
  isLoggedIn: boolean
  isAuthChecked: boolean
  userId: number | null
  hasAccount: boolean
  hasUnreadNotifications: boolean
  isCertificateSheetOpen: boolean
  setMenuOpen: (open: boolean) => void
  setLoggedIn: (loggedIn: boolean) => void
  setAuthenticated: (userId: number) => void
  clearAuth: () => void
  setHasAccount: (hasAccount: boolean) => void
  setHasUnreadNotifications: (hasUnread: boolean) => void
  setCertificateSheetOpen: (open: boolean) => void
  logout: () => void
}

export const useMainPageStore = create<MainPageState>((set) => ({
  isMenuOpen: false,
  isLoggedIn: false,
  isAuthChecked: false,
  userId: null,
  hasAccount: false,
  hasUnreadNotifications: true,
  isCertificateSheetOpen: false,
  setMenuOpen: (open) => set({ isMenuOpen: open }),
  setLoggedIn: (loggedIn) =>
    set((state) => ({
      isLoggedIn: loggedIn,
      isAuthChecked: true,
      userId: loggedIn ? state.userId : null,
    })),
  setAuthenticated: (userId) => set({ isLoggedIn: true, isAuthChecked: true, userId }),
  clearAuth: () => set({ isLoggedIn: false, isAuthChecked: true, userId: null }),
  setHasAccount: (hasAccount) => set({ hasAccount }),
  setHasUnreadNotifications: (hasUnreadNotifications) => set({ hasUnreadNotifications }),
  setCertificateSheetOpen: (isCertificateSheetOpen) => set({ isCertificateSheetOpen }),
  logout: () => {
    clearSessionStorage()
    set({ isLoggedIn: false, isAuthChecked: true, userId: null, hasAccount: false })
  },
}))

interface Step1PageState {
  name: string
  email: string
  setName: (name: string) => void
  setEmail: (email: string) => void
}

export const useStep1PageStore = create<Step1PageState>((set) => ({
  name: '',
  email: '',
  setName: (name) => set({ name }),
  setEmail: (email) => set({ email }),
}))

type SignupGender = "male" | "female" | "";

interface SignupPageState {
  email: string;
  verificationCode: string;
  name: string;
  birthDate: string;
  gender: SignupGender;
  password: string;
  passwordConfirm: string;
  setEmail: (email: string) => void;
  setVerificationCode: (verificationCode: string) => void;
  setName: (name: string) => void;
  setBirthDate: (birthDate: string) => void;
  setGender: (gender: SignupGender) => void;
  setPassword: (password: string) => void;
  setPasswordConfirm: (passwordConfirm: string) => void;
  resetEmailVerification: () => void;
  resetPersonalInfo: () => void;
  resetPassword: () => void;
  resetSignup: () => void;
}

const signupInitialState = {
  email: "",
  verificationCode: "",
  name: "",
  birthDate: "",
  gender: "" as SignupGender,
  password: "",
  passwordConfirm: "",
};

export const useSignupPageStore = create<SignupPageState>((set) => ({
  ...signupInitialState,
  setEmail: (email) => set({ email }),
  setVerificationCode: (verificationCode) => set({ verificationCode }),
  setName: (name) => set({ name }),
  setBirthDate: (birthDate) => set({ birthDate }),
  setGender: (gender) => set({ gender }),
  setPassword: (password) => set({ password }),
  setPasswordConfirm: (passwordConfirm) => set({ passwordConfirm }),
  resetEmailVerification: () => set({ email: "", verificationCode: "" }),
  resetPersonalInfo: () => set({ name: "", birthDate: "", gender: "" }),
  resetPassword: () => set({ password: "", passwordConfirm: "" }),
  resetSignup: () => set(signupInitialState),
}));

interface TransactionHistoryPageState {
  isFilterOpen: boolean
  selectedPeriod: string
  selectedType: string
  setFilterOpen: (open: boolean) => void
  setSelectedPeriod: (period: string) => void
  setSelectedType: (type: string) => void
}

export const useTransactionHistoryPageStore = create<TransactionHistoryPageState>((set) => ({
  isFilterOpen: false,
  selectedPeriod: '전체',
  selectedType: '전체',
  setFilterOpen: (isFilterOpen) => set({ isFilterOpen }),
  setSelectedPeriod: (selectedPeriod) => set({ selectedPeriod }),
  setSelectedType: (selectedType) => set({ selectedType }),
}))

interface DesignSystemPageState {
  inputValue: string
  isBottomSheetOpen: boolean
  isFilterSheetOpen: boolean
  isPinSheetOpen: boolean
  selectedPeriod: string
  selectedType: string
  setInputValue: (value: string) => void
  setBottomSheetOpen: (open: boolean) => void
  setFilterSheetOpen: (open: boolean) => void
  setPinSheetOpen: (open: boolean) => void
  setSelectedPeriod: (period: string) => void
  setSelectedType: (type: string) => void
}

export const useDesignSystemPageStore = create<DesignSystemPageState>((set) => ({
  inputValue: '',
  isBottomSheetOpen: false,
  isFilterSheetOpen: false,
  isPinSheetOpen: false,
  selectedPeriod: 'all',
  selectedType: 'all',
  setInputValue: (inputValue) => set({ inputValue }),
  setBottomSheetOpen: (isBottomSheetOpen) => set({ isBottomSheetOpen }),
  setFilterSheetOpen: (isFilterSheetOpen) => set({ isFilterSheetOpen }),
  setPinSheetOpen: (isPinSheetOpen) => set({ isPinSheetOpen }),
  setSelectedPeriod: (selectedPeriod) => set({ selectedPeriod }),
  setSelectedType: (selectedType) => set({ selectedType }),
}))

interface Step3DocumentItem {
  id: 'registration-application' | 'residence-proof'
  title: string
  file: File | null
  error: string | null
}

interface Step3PageState {
  documents: Step3DocumentItem[]
  setDocumentFile: (id: Step3DocumentItem['id'], file: File | null) => void
  setDocumentError: (id: Step3DocumentItem['id'], error: string | null) => void
  reset: () => void
}

const initialStep3Documents: Step3DocumentItem[] = [
  { id: 'registration-application', title: '외국인등록증 신청 서류', file: null, error: null },
  { id: 'residence-proof', title: '거소확인 증빙 서류', file: null, error: null },
]

export const useStep3PageStore = create<Step3PageState>((set) => ({
  documents: initialStep3Documents,
  setDocumentFile: (id, file) =>
    set((state) => ({
      documents: state.documents.map((item) =>
        item.id === id ? { ...item, file, error: null } : item
      ),
    })),
  setDocumentError: (id, error) =>
    set((state) => ({
      documents: state.documents.map((item) => (item.id === id ? { ...item, error } : item)),
    })),
  reset: () =>
    set({
      documents: initialStep3Documents,
    }),
}))

interface Step5PassportCaptureState {
  mode: 'live' | 'review'
  capturedImage: string | null
  cameraError: string | null
  parsedPassportData: {
    docType: string
    nationalityCode: string
    passportNumber: string
    surname: string
    givenNames: string
    birthDate: string
    sex: string
    country: string
    issuingCountryCode: string
    authority: string
    issueDate: string
    expiryDate: string
  } | null
  setMode: (mode: 'live' | 'review') => void
  setCapturedImage: (capturedImage: string | null) => void
  setCameraError: (cameraError: string | null) => void
  setParsedPassportData: (parsedPassportData: Step5PassportCaptureState['parsedPassportData']) => void
  reset: () => void
}

export const useStep5PassportCaptureStore = create<Step5PassportCaptureState>((set) => ({
  mode: 'live',
  capturedImage: null,
  cameraError: null,
  parsedPassportData: null,
  setMode: (mode) => set({ mode }),
  setCapturedImage: (capturedImage) => set({ capturedImage }),
  setCameraError: (cameraError) => set({ cameraError }),
  setParsedPassportData: (parsedPassportData) => set({ parsedPassportData }),
  reset: () =>
    set({
      mode: 'live',
      capturedImage: null,
      cameraError: null,
      parsedPassportData: null,
    }),
}))

interface LivenessFlowState {
  sessionId: string | null
  expiresAt: string | null
  setSession: (sessionId: string, expiresAt: string) => void
  resetSession: () => void
}

export const useLivenessFlowStore = create<LivenessFlowState>((set) => ({
  sessionId: null,
  expiresAt: null,
  setSession: (sessionId, expiresAt) => set({ sessionId, expiresAt }),
  resetSession: () => set({ sessionId: null, expiresAt: null }),
}))

interface Step10TermsPageState {
  checkedTermIds: string[]
  openCategoryIds: string[]
  categoryCursor: Record<string, number>
  setCheckedTermIds: (ids: string[]) => void
  setOpenCategoryIds: (ids: string[]) => void
  setCategoryCursor: (categoryId: string, index: number) => void
  reset: () => void
}

export const useStep10TermsPageStore = create<Step10TermsPageState>((set) => ({
  checkedTermIds: [],
  openCategoryIds: ['required-service'],
  categoryCursor: {},
  setCheckedTermIds: (checkedTermIds) => set({ checkedTermIds }),
  setOpenCategoryIds: (openCategoryIds) => set({ openCategoryIds }),
  setCategoryCursor: (categoryId, index) =>
    set((state) => ({
      categoryCursor: {
        ...state.categoryCursor,
        [categoryId]: Math.max(0, Math.floor(index)),
      },
    })),
  reset: () =>
    set({
      checkedTermIds: [],
      openCategoryIds: ['required-service'],
      categoryCursor: {},
    }),
}))

interface ConsentCarouselTemplateState {
  currentIndex: number
  setCurrentIndex: (index: number | ((prev: number) => number)) => void
  reset: () => void
}

export const useConsentCarouselTemplateStore = create<ConsentCarouselTemplateState>((set) => ({
  currentIndex: 0,
  setCurrentIndex: (currentIndex) =>
    set((state) => ({
      currentIndex:
        typeof currentIndex === 'function'
          ? Math.max(0, currentIndex(state.currentIndex))
          : Math.max(0, currentIndex),
    })),
  reset: () => set({ currentIndex: 0 }),
}))
