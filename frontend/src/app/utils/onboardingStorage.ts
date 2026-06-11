const ONBOARDING_COMPLETED_KEY = "nova:onboardingCompleted";
const LANGUAGE_KEY = "nova:language";

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
  getLocalStorage()?.setItem(LANGUAGE_KEY, languageId);
}

export function getOnboardingLanguage() {
  return getLocalStorage()?.getItem(LANGUAGE_KEY) ?? null;
}
