const ONBOARDING_COMPLETED_KEY = "nova:onboardingCompleted";
const LANGUAGE_COOKIE_NAME = "NOVA_LANGUAGE";
const LANGUAGE_COOKIE_MAX_AGE_SECONDS = 31_536_000;

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
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = [
    `${LANGUAGE_COOKIE_NAME}=${encodeURIComponent(languageId)}`,
    "Path=/",
    `Max-Age=${LANGUAGE_COOKIE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
  ].join("; ");
}

export function getOnboardingLanguage() {
  if (typeof document === "undefined") {
    return null;
  }

  const languageCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${LANGUAGE_COOKIE_NAME}=`));

  return languageCookie ? decodeURIComponent(languageCookie.split("=")[1]) : null;
}
