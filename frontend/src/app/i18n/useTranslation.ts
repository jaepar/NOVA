import { useMemo, useSyncExternalStore } from "react";
import { translate } from "./dictionary";
import {
  getLanguageCookie,
  setLanguageCookie,
  subscribeLanguageCookieChange,
} from "./languageCookie";

export function useTranslation() {
  const language = useSyncExternalStore(
    subscribeLanguageCookieChange,
    getLanguageCookie,
    getLanguageCookie
  );

  return useMemo(
    () => ({
      language,
      setLanguage: setLanguageCookie,
      t: (key: string, fallback?: string) => translate(language, key, fallback),
    }),
    [language]
  );
}
