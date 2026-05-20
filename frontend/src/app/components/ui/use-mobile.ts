import * as React from "react";
import { create } from "zustand";

const MOBILE_BREAKPOINT = 768;

const useMobileStore = create<{
  isMobile: boolean;
  setIsMobile: (next: boolean) => void;
}>((set) => ({
  isMobile: false,
  setIsMobile: (next) => set({ isMobile: next }),
}));

export function useIsMobile() {
  const isMobile = useMobileStore((state) => state.isMobile);
  const setIsMobile = useMobileStore((state) => state.setIsMobile);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
