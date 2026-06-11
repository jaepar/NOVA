import { getLanguageCookie } from './languageCookie'
import { translate } from './dictionary'

export function translateError(code: string | null | undefined, fallbackMessage?: string) {
  if (!code) {
    return fallbackMessage ?? ''
  }

  return translate(getLanguageCookie(), `errors.${code}`, fallbackMessage)
}
