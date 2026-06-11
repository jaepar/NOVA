import { Navigate } from "react-router-dom";
import { isOnboardingCompleted } from "../utils/onboardingStorage";
import { useMainPageStore } from "../stores/pageStores";

export function EntryRedirect() {
  const isLoggedIn = useMainPageStore((state) => state.isLoggedIn);

  if (isLoggedIn || isOnboardingCompleted()) {
    return <Navigate to="/main" replace />;
  }

  return <Navigate to="/landing" replace />;
}
