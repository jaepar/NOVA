import { create } from "zustand";
import type { WalletTransactionFilter } from "../data/walletMockData";

type ChargeFeedback = {
  type: "error";
  message: string;
};

type ChargeSuccess = {
  amount: number;
  chargedAt: Date;
};

interface WalletState {
  selectedFilter: WalletTransactionFilter;
  filterOpen: boolean;
  chargeAmount: string;
  chargeFeedback: ChargeFeedback | null;
  chargeSuccess: ChargeSuccess | null;
  isChargeSubmitting: boolean;
  amountInputWidth: number;
  qrSeed: number;
  checkedTermIds: string[];
  expandedTermId: string | null;
  agreementsOpen: boolean;
  setSelectedFilter: (selectedFilter: WalletTransactionFilter) => void;
  setFilterOpen: (filterOpen: boolean | ((current: boolean) => boolean)) => void;
  setChargeAmount: (chargeAmount: string) => void;
  setChargeFeedback: (chargeFeedback: ChargeFeedback | null) => void;
  setChargeSuccess: (chargeSuccess: ChargeSuccess | null) => void;
  setChargeSubmitting: (isChargeSubmitting: boolean) => void;
  setAmountInputWidth: (amountInputWidth: number) => void;
  clearChargeAmount: () => void;
  resetChargeFlow: () => void;
  refreshQrSeed: () => void;
  resetQrSeed: () => void;
  toggleTerm: (termId: string) => void;
  toggleAllRequiredTerms: (requiredTermIds: string[]) => void;
  toggleExpandedTerm: (termId: string) => void;
  setAgreementsOpen: (agreementsOpen: boolean | ((current: boolean) => boolean)) => void;
  resetTermsFlow: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  selectedFilter: "all",
  filterOpen: false,
  chargeAmount: "",
  chargeFeedback: null,
  chargeSuccess: null,
  isChargeSubmitting: false,
  amountInputWidth: 0,
  qrSeed: 1,
  checkedTermIds: [],
  expandedTermId: null,
  agreementsOpen: true,
  setSelectedFilter: (selectedFilter) => set({ selectedFilter }),
  setFilterOpen: (filterOpen) =>
    set((state) => ({
      filterOpen:
        typeof filterOpen === "function" ? filterOpen(state.filterOpen) : filterOpen,
    })),
  setChargeAmount: (chargeAmount) => set({ chargeAmount }),
  setChargeFeedback: (chargeFeedback) => set({ chargeFeedback }),
  setChargeSuccess: (chargeSuccess) => set({ chargeSuccess }),
  setChargeSubmitting: (isChargeSubmitting) => set({ isChargeSubmitting }),
  setAmountInputWidth: (amountInputWidth) => set({ amountInputWidth }),
  clearChargeAmount: () => set({ chargeAmount: "", chargeSuccess: null }),
  resetChargeFlow: () =>
    set({
      chargeAmount: "",
      chargeFeedback: null,
      chargeSuccess: null,
      isChargeSubmitting: false,
      amountInputWidth: 0,
    }),
  refreshQrSeed: () => set((state) => ({ qrSeed: state.qrSeed + 1 })),
  resetQrSeed: () => set({ qrSeed: 1 }),
  toggleTerm: (termId) =>
    set((state) => ({
      checkedTermIds: state.checkedTermIds.includes(termId)
        ? state.checkedTermIds.filter((id) => id !== termId)
        : [...state.checkedTermIds, termId],
    })),
  toggleAllRequiredTerms: (requiredTermIds) =>
    set((state) => ({
      checkedTermIds: requiredTermIds.every((id) => state.checkedTermIds.includes(id))
        ? []
        : requiredTermIds,
    })),
  toggleExpandedTerm: (termId) =>
    set((state) => ({
      expandedTermId: state.expandedTermId === termId ? null : termId,
    })),
  setAgreementsOpen: (agreementsOpen) =>
    set((state) => ({
      agreementsOpen:
        typeof agreementsOpen === "function"
          ? agreementsOpen(state.agreementsOpen)
          : agreementsOpen,
    })),
  resetTermsFlow: () =>
    set({
      checkedTermIds: [],
      expandedTermId: null,
      agreementsOpen: true,
    }),
}));
