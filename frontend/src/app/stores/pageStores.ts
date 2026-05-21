import { create } from "zustand";

interface MainPageState {
  isMenuOpen: boolean;
  isLoggedIn: boolean;
  hasAccount: boolean;
  hasUnreadNotifications: boolean;
  isCertificateSheetOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  setLoggedIn: (loggedIn: boolean) => void;
  setHasAccount: (hasAccount: boolean) => void;
  setHasUnreadNotifications: (hasUnread: boolean) => void;
  setCertificateSheetOpen: (open: boolean) => void;
  logout: () => void;
}

export const useMainPageStore = create<MainPageState>((set) => ({
  isMenuOpen: false,
  isLoggedIn: false,
  hasAccount: false,
  hasUnreadNotifications: true,
  isCertificateSheetOpen: false,
  setMenuOpen: (open) => set({ isMenuOpen: open }),
  setLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
  setHasAccount: (hasAccount) => set({ hasAccount }),
  setHasUnreadNotifications: (hasUnreadNotifications) => set({ hasUnreadNotifications }),
  setCertificateSheetOpen: (isCertificateSheetOpen) => set({ isCertificateSheetOpen }),
  logout: () => set({ isLoggedIn: false, hasAccount: false }),
}));

interface Step1PageState {
  name: string;
  email: string;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
}

export const useStep1PageStore = create<Step1PageState>((set) => ({
  name: "",
  email: "",
  setName: (name) => set({ name }),
  setEmail: (email) => set({ email }),
}));

interface TransactionHistoryPageState {
  isFilterOpen: boolean;
  selectedPeriod: string;
  selectedType: string;
  setFilterOpen: (open: boolean) => void;
  setSelectedPeriod: (period: string) => void;
  setSelectedType: (type: string) => void;
}

export const useTransactionHistoryPageStore = create<TransactionHistoryPageState>((set) => ({
  isFilterOpen: false,
  selectedPeriod: "전체",
  selectedType: "전체",
  setFilterOpen: (isFilterOpen) => set({ isFilterOpen }),
  setSelectedPeriod: (selectedPeriod) => set({ selectedPeriod }),
  setSelectedType: (selectedType) => set({ selectedType }),
}));

interface DesignSystemPageState {
  inputValue: string;
  isBottomSheetOpen: boolean;
  isFilterSheetOpen: boolean;
  isPinSheetOpen: boolean;
  selectedPeriod: string;
  selectedType: string;
  setInputValue: (value: string) => void;
  setBottomSheetOpen: (open: boolean) => void;
  setFilterSheetOpen: (open: boolean) => void;
  setPinSheetOpen: (open: boolean) => void;
  setSelectedPeriod: (period: string) => void;
  setSelectedType: (type: string) => void;
}

export const useDesignSystemPageStore = create<DesignSystemPageState>((set) => ({
  inputValue: "",
  isBottomSheetOpen: false,
  isFilterSheetOpen: false,
  isPinSheetOpen: false,
  selectedPeriod: "all",
  selectedType: "all",
  setInputValue: (inputValue) => set({ inputValue }),
  setBottomSheetOpen: (isBottomSheetOpen) => set({ isBottomSheetOpen }),
  setFilterSheetOpen: (isFilterSheetOpen) => set({ isFilterSheetOpen }),
  setPinSheetOpen: (isPinSheetOpen) => set({ isPinSheetOpen }),
  setSelectedPeriod: (selectedPeriod) => set({ selectedPeriod }),
  setSelectedType: (selectedType) => set({ selectedType }),
}));

interface Step3DocumentItem {
  id: "registration-application" | "residence-proof";
  title: string;
  file: File | null;
  error: string | null;
}

interface Step3PageState {
  documents: Step3DocumentItem[];
  setDocumentFile: (id: Step3DocumentItem["id"], file: File | null) => void;
  setDocumentError: (id: Step3DocumentItem["id"], error: string | null) => void;
  reset: () => void;
}

const initialStep3Documents: Step3DocumentItem[] = [
  { id: "registration-application", title: "외국인등록증 신청 서류", file: null, error: null },
  { id: "residence-proof", title: "거소확인 증빙 서류", file: null, error: null },
];

export const useStep3PageStore = create<Step3PageState>((set) => ({
  documents: initialStep3Documents,
  setDocumentFile: (id, file) =>
    set((state) => ({
      documents: state.documents.map((item) => (item.id === id ? { ...item, file, error: null } : item)),
    })),
  setDocumentError: (id, error) =>
    set((state) => ({
      documents: state.documents.map((item) => (item.id === id ? { ...item, error } : item)),
    })),
  reset: () =>
    set({
      documents: initialStep3Documents,
    }),
}));

interface Step5PassportCaptureState {
  mode: "live" | "review";
  capturedImage: string | null;
  cameraError: string | null;
  setMode: (mode: "live" | "review") => void;
  setCapturedImage: (capturedImage: string | null) => void;
  setCameraError: (cameraError: string | null) => void;
  reset: () => void;
}

export const useStep5PassportCaptureStore = create<Step5PassportCaptureState>((set) => ({
  mode: "live",
  capturedImage: null,
  cameraError: null,
  setMode: (mode) => set({ mode }),
  setCapturedImage: (capturedImage) => set({ capturedImage }),
  setCameraError: (cameraError) => set({ cameraError }),
  reset: () =>
    set({
      mode: "live",
      capturedImage: null,
      cameraError: null,
    }),
}));

interface Step10TermsPageState {
  checkedTermIds: string[];
  openCategoryIds: string[];
  categoryCursor: Record<string, number>;
  setCheckedTermIds: (ids: string[]) => void;
  setOpenCategoryIds: (ids: string[]) => void;
  setCategoryCursor: (categoryId: string, index: number) => void;
  reset: () => void;
}

export const useStep10TermsPageStore = create<Step10TermsPageState>((set) => ({
  checkedTermIds: [],
  openCategoryIds: ["required-service"],
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
      openCategoryIds: ["required-service"],
      categoryCursor: {},
    }),
}));

interface ConsentCarouselTemplateState {
  currentIndex: number;
  setCurrentIndex: (index: number | ((prev: number) => number)) => void;
  reset: () => void;
}

export const useConsentCarouselTemplateStore = create<ConsentCarouselTemplateState>((set) => ({
  currentIndex: 0,
  setCurrentIndex: (currentIndex) =>
    set((state) => ({
      currentIndex:
        typeof currentIndex === "function" ? Math.max(0, currentIndex(state.currentIndex)) : Math.max(0, currentIndex),
    })),
  reset: () => set({ currentIndex: 0 }),
}));
