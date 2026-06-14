import { en } from "./locales/en";
import { ko } from "./locales/ko";

export const DEFAULT_LANGUAGE = "ko";

export const dictionaries = {
  ko,
  en,
} as const;

export type SupportedLanguage = keyof typeof dictionaries;

export function isSupportedLanguage(language: string): language is SupportedLanguage {
  return language in dictionaries;
}

export function normalizeLanguage(language: string | null | undefined): SupportedLanguage {
  if (!language) {
    return DEFAULT_LANGUAGE;
  }

  const normalized = language.trim().toLowerCase();

  return isSupportedLanguage(normalized) ? normalized : DEFAULT_LANGUAGE;
}

function readPath(source: unknown, key: string) {
  return key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }

    return undefined;
  }, source);
}

export function translate(
  language: string | null | undefined,
  key: string,
  fallback?: string
) {
  const supportedLanguage = normalizeLanguage(language);
  const translatedValue = readPath(dictionaries[supportedLanguage], key);

  if (typeof translatedValue === "string") {
    return translatedValue;
  }

  if (supportedLanguage !== DEFAULT_LANGUAGE) {
    const defaultValue = readPath(dictionaries[DEFAULT_LANGUAGE], key);
    if (typeof defaultValue === "string") {
      return defaultValue;
    }
  }

  return fallback ?? key;
}
