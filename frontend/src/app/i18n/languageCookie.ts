import { DEFAULT_LANGUAGE } from "./dictionary";

export const LANGUAGE_COOKIE_NAME = "NOVA_LANGUAGE";

const LANGUAGE_COOKIE_MAX_AGE_SECONDS = 31_536_000;
const LANGUAGE_CHANGE_EVENT = "nova-language-change";

function findCookieValue(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
}

export function getLanguageCookie() {
  return findCookieValue(LANGUAGE_COOKIE_NAME) ?? DEFAULT_LANGUAGE;
}

export function setLanguageCookie(language: string) {
  if (typeof document === "undefined") {
    return;
  }

  const normalizedLanguage = language.trim().toLowerCase() || DEFAULT_LANGUAGE;

  document.cookie = [
    `${LANGUAGE_COOKIE_NAME}=${encodeURIComponent(normalizedLanguage)}`,
    "Path=/",
    `Max-Age=${LANGUAGE_COOKIE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
  ].join("; ");

  window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT));
}

export function subscribeLanguageCookieChange(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  let lastKnown = getLanguageCookie();

  const handleFocus = () => {
    const current = getLanguageCookie();
    if (current !== lastKnown) {
      lastKnown = current;
      onChange();
    }
  };

  window.addEventListener(LANGUAGE_CHANGE_EVENT, onChange);
  window.addEventListener("focus", handleFocus);

  return () => {
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, onChange);
    window.removeEventListener("focus", handleFocus);
  };
}
