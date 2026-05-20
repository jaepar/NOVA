import { create } from "zustand";

interface MainPageState {
  isMenuOpen: boolean;
  isLoggedIn: boolean;
  hasAccount: boolean;
  hasUnreadNotifications: boolean;
  setMenuOpen: (open: boolean) => void;
  setLoggedIn: (loggedIn: boolean) => void;
  setHasAccount: (hasAccount: boolean) => void;
  setHasUnreadNotifications: (hasUnread: boolean) => void;
  logout: () => void;
}

export const useMainPageStore = create<MainPageState>((set) => ({
  isMenuOpen: false,
  isLoggedIn: false,
  hasAccount: false,
  hasUnreadNotifications: true,
  setMenuOpen: (open) => set({ isMenuOpen: open }),
  setLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
  setHasAccount: (hasAccount) => set({ hasAccount }),
  setHasUnreadNotifications: (hasUnreadNotifications) => set({ hasUnreadNotifications }),
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
