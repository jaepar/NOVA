import { getLanguageCookie, setLanguageCookie } from "../i18n";

const ONBOARDING_COMPLETED_KEY = "nova:onboardingCompleted";

function getLocalStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function isOnboardingCompleted() {
  return getLocalStorage()?.getItem(ONBOARDING_COMPLETED_KEY) === "true";
}

export function completeOnboarding() {
  getLocalStorage()?.setItem(ONBOARDING_COMPLETED_KEY, "true");
}

export function saveOnboardingLanguage(languageId: string) {
  setLanguageCookie(languageId);
}

export function getOnboardingLanguage() {
  return getLanguageCookie();
}
