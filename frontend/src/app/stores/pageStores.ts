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
  hasUnreadNotifications: false,
  isCertificateSheetOpen: false,
  setMenuOpen: (open) => set({ isMenuOpen: open }),
  setLoggedIn: (loggedIn) =>
    set((state) => ({
      isLoggedIn: loggedIn,
      isAuthChecked: true,
      userId: loggedIn ? state.userId : null,
    })),
  setAuthenticated: (userId) => set({ isLoggedIn: true, isAuthChecked: true, userId }),
  clearAuth: () =>
    set({
      isLoggedIn: false,
      isAuthChecked: true,
      userId: null,
      hasUnreadNotifications: false,
    }),
  setHasAccount: (hasAccount) => set({ hasAccount }),
  setHasUnreadNotifications: (hasUnreadNotifications) => set({ hasUnreadNotifications }),
  setCertificateSheetOpen: (isCertificateSheetOpen) => set({ isCertificateSheetOpen }),
  logout: () => {
    clearSessionStorage()
    set({
      isLoggedIn: false,
      isAuthChecked: true,
      userId: null,
      hasAccount: false,
      hasUnreadNotifications: false,
    })
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

interface TransferSendPageState {
  isInitialVerificationComplete: boolean
  completeInitialVerification: () => void
  resetInitialVerification: () => void
}

export const useTransferSendPageStore = create<TransferSendPageState>((set) => ({
  isInitialVerificationComplete: false,
  completeInitialVerification: () => set({ isInitialVerificationComplete: true }),
  resetInitialVerification: () => set({ isInitialVerificationComplete: false }),
}))

type TransferFeeBurden = 'sender' | 'receiver'

interface TransferBasicInfoPageState {
  purpose: string
  countryId: string
  currencyCode: string
  amount: string
  feeBurden: TransferFeeBurden
  setPurpose: (purpose: string) => void
  setCountryId: (countryId: string) => void
  setCurrencyCode: (currencyCode: string) => void
  setAmount: (amount: string) => void
  setFeeBurden: (feeBurden: TransferFeeBurden) => void
  reset: () => void
}

const transferBasicInfoInitialState = {
  purpose: '거주자(외국인 제외)의 무증빙 해외송금',
  countryId: 'us',
  currencyCode: 'USD',
  amount: '',
  feeBurden: 'sender' as TransferFeeBurden,
}

export const useTransferBasicInfoPageStore = create<TransferBasicInfoPageState>((set) => ({
  ...transferBasicInfoInitialState,
  setPurpose: (purpose) => set({ purpose }),
  setCountryId: (countryId) => set({ countryId }),
  setCurrencyCode: (currencyCode) => set({ currencyCode }),
  setAmount: (amount) => set({ amount }),
  setFeeBurden: (feeBurden) => set({ feeBurden }),
  reset: () => set(transferBasicInfoInitialState),
}))

interface TransferSenderInfoPageState {
  senderName: string
  phoneNumber: string
  address: string
  detailAddress: string
  district: string
  city: string
  postalCode: string
  countryId: string
  setSenderName: (senderName: string) => void
  setPhoneNumber: (phoneNumber: string) => void
  setAddress: (address: string) => void
  setDetailAddress: (detailAddress: string) => void
  setDistrict: (district: string) => void
  setCity: (city: string) => void
  setPostalCode: (postalCode: string) => void
  setCountryId: (countryId: string) => void
  reset: () => void
}

const transferSenderInfoInitialState = {
  senderName: '',
  phoneNumber: '',
  address: '',
  detailAddress: '',
  district: '',
  city: '',
  postalCode: '',
  countryId: 'kr',
}

export const useTransferSenderInfoPageStore = create<TransferSenderInfoPageState>((set) => ({
  ...transferSenderInfoInitialState,
  setSenderName: (senderName) => set({ senderName }),
  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
  setAddress: (address) => set({ address }),
  setDetailAddress: (detailAddress) => set({ detailAddress }),
  setDistrict: (district) => set({ district }),
  setCity: (city) => set({ city }),
  setPostalCode: (postalCode) => set({ postalCode }),
  setCountryId: (countryId) => set({ countryId }),
  reset: () => set(transferSenderInfoInitialState),
}))

type TransferPaymentDetailMode = 'reason-select' | 'manual-input'

interface TransferRecipientInfoPageState {
  recipientName: string
  recipientAddress: string
  recipientDetailAddress: string
  recipientDistrict: string
  recipientCity: string
  recipientPostalCode: string
  recipientPhoneNumber: string
  swiftCode: string
  accountNumber: string
  routingNumber: string
  bankBranchName: string
  paymentDetailMode: TransferPaymentDetailMode
  paymentReason: string
  manualPaymentDetail: string
  setRecipientName: (recipientName: string) => void
  setRecipientAddress: (recipientAddress: string) => void
  setRecipientDetailAddress: (recipientDetailAddress: string) => void
  setRecipientDistrict: (recipientDistrict: string) => void
  setRecipientCity: (recipientCity: string) => void
  setRecipientPostalCode: (recipientPostalCode: string) => void
  setRecipientPhoneNumber: (recipientPhoneNumber: string) => void
  setSwiftCode: (swiftCode: string) => void
  setAccountNumber: (accountNumber: string) => void
  setRoutingNumber: (routingNumber: string) => void
  setBankBranchName: (bankBranchName: string) => void
  setPaymentDetailMode: (paymentDetailMode: TransferPaymentDetailMode) => void
  setPaymentReason: (paymentReason: string) => void
  setManualPaymentDetail: (manualPaymentDetail: string) => void
  reset: () => void
}

const transferRecipientInfoInitialState = {
  recipientName: '',
  recipientAddress: '',
  recipientDetailAddress: '',
  recipientDistrict: '',
  recipientCity: '',
  recipientPostalCode: '',
  recipientPhoneNumber: '',
  swiftCode: '',
  accountNumber: '',
  routingNumber: '',
  bankBranchName: '',
  paymentDetailMode: 'reason-select' as TransferPaymentDetailMode,
  paymentReason: '',
  manualPaymentDetail: '',
}

export const useTransferRecipientInfoPageStore = create<TransferRecipientInfoPageState>((set) => ({
  ...transferRecipientInfoInitialState,
  setRecipientName: (recipientName) => set({ recipientName }),
  setRecipientAddress: (recipientAddress) => set({ recipientAddress }),
  setRecipientDetailAddress: (recipientDetailAddress) => set({ recipientDetailAddress }),
  setRecipientDistrict: (recipientDistrict) => set({ recipientDistrict }),
  setRecipientCity: (recipientCity) => set({ recipientCity }),
  setRecipientPostalCode: (recipientPostalCode) => set({ recipientPostalCode }),
  setRecipientPhoneNumber: (recipientPhoneNumber) => set({ recipientPhoneNumber }),
  setSwiftCode: (swiftCode) => set({ swiftCode }),
  setAccountNumber: (accountNumber) => set({ accountNumber }),
  setRoutingNumber: (routingNumber) => set({ routingNumber }),
  setBankBranchName: (bankBranchName) => set({ bankBranchName }),
  setPaymentDetailMode: (paymentDetailMode) => set({ paymentDetailMode }),
  setPaymentReason: (paymentReason) => set({ paymentReason }),
  setManualPaymentDetail: (manualPaymentDetail) => set({ manualPaymentDetail }),
  reset: () => set(transferRecipientInfoInitialState),
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
    type: string
    issueCountry: string
    num: string
    surName: string
    givenName: string
    nationlity: string
    birthDate: string
    sex: string
    authority: string
    issueDate: string
    expireDate: string
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

type ForeignerCardOcrValues = {
  name: string
  registrationNumber: string
  issueDate: string
}

interface ForeignerCardRegistrationState {
  capturedImage: string | null
  cameraError: string | null
  ocrValues: ForeignerCardOcrValues
  verificationStatus: string | null
  failureReasonCode: string | null
  setCapturedImage: (capturedImage: string | null) => void
  setCameraError: (cameraError: string | null) => void
  setOcrValues: (ocrValues: ForeignerCardOcrValues) => void
  setOcrValue: (key: keyof ForeignerCardOcrValues, value: string) => void
  setVerificationResult: (verificationStatus: string | null, failureReasonCode: string | null) => void
  reset: () => void
}

const initialForeignerCardOcrValues: ForeignerCardOcrValues = {
  name: '',
  registrationNumber: '',
  issueDate: '',
}

export const useForeignerCardRegistrationStore = create<ForeignerCardRegistrationState>((set) => ({
  capturedImage: null,
  cameraError: null,
  ocrValues: initialForeignerCardOcrValues,
  verificationStatus: null,
  failureReasonCode: null,
  setCapturedImage: (capturedImage) => set({ capturedImage }),
  setCameraError: (cameraError) => set({ cameraError }),
  setOcrValues: (ocrValues) => set({ ocrValues }),
  setOcrValue: (key, value) =>
    set((state) => ({
      ocrValues: {
        ...state.ocrValues,
        [key]: value,
      },
    })),
  setVerificationResult: (verificationStatus, failureReasonCode) =>
    set({ verificationStatus, failureReasonCode }),
  reset: () =>
    set({
      capturedImage: null,
      cameraError: null,
      ocrValues: initialForeignerCardOcrValues,
      verificationStatus: null,
      failureReasonCode: null,
    }),
}))

interface LivenessFlowState {
  sessionId: string | null
  expiresAt: string | null
  registeredPassportIssueCountry: string | null
  registeredPassportNumber: string | null
  setSession: (sessionId: string, expiresAt: string) => void
  setRegisteredPassportIdentity: (issueCountry: string, passportNumber: string) => void
  resetSession: () => void
}

export const useLivenessFlowStore = create<LivenessFlowState>((set) => ({
  sessionId: null,
  expiresAt: null,
  registeredPassportIssueCountry: null,
  registeredPassportNumber: null,
  setSession: (sessionId, expiresAt) => set({ sessionId, expiresAt }),
  setRegisteredPassportIdentity: (registeredPassportIssueCountry, registeredPassportNumber) =>
    set({ registeredPassportIssueCountry, registeredPassportNumber }),
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

interface AccountCreateFlowState {
  address: string
  addressDetail: string
  job: string
  isOwner: boolean
  transactionPurpose: string
  fundSource: string
  hasForeignTax: boolean
  setCustomerInfo: (address: string, addressDetail: string) => void
  setJob: (job: string) => void
  setTransactionInfo: (isOwner: boolean, transactionPurpose: string, fundSource: string) => void
  setHasForeignTax: (hasForeignTax: boolean) => void
  reset: () => void
}

const initialAccountCreateFlowState = {
  address: '',
  addressDetail: '',
  job: '',
  isOwner: false,
  transactionPurpose: '',
  fundSource: '',
  hasForeignTax: false,
}

export const useAccountCreateFlowStore = create<AccountCreateFlowState>((set) => ({
  ...initialAccountCreateFlowState,
  setCustomerInfo: (address, addressDetail) => set({ address, addressDetail }),
  setJob: (job) => set({ job }),
  setTransactionInfo: (isOwner, transactionPurpose, fundSource) =>
    set({ isOwner, transactionPurpose, fundSource }),
  setHasForeignTax: (hasForeignTax) => set({ hasForeignTax }),
  reset: () => set(initialAccountCreateFlowState),
}))
