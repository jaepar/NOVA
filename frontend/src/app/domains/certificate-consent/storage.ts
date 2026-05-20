const AGREED_TERM_IDS_KEY = "certificate_consent_agreed_term_ids";
const OPEN_CATEGORY_IDS_KEY = "certificate_consent_open_category_ids";
const CATEGORY_CURSOR_KEY = "certificate_consent_category_cursor";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  const raw = window.sessionStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function getAgreedTermIds() {
  const values = readJson<string[]>(AGREED_TERM_IDS_KEY, []);
  return new Set(values);
}

export function setAgreedTermIds(termIds: Set<string>) {
  writeJson(AGREED_TERM_IDS_KEY, Array.from(termIds));
}

export function markTermAgreed(termId: string) {
  const next = getAgreedTermIds();
  next.add(termId);
  setAgreedTermIds(next);
}

export function markTermsAgreed(termIds: string[]) {
  const next = getAgreedTermIds();
  termIds.forEach((termId) => next.add(termId));
  setAgreedTermIds(next);
}

export function unmarkTermAgreed(termId: string) {
  const next = getAgreedTermIds();
  next.delete(termId);
  setAgreedTermIds(next);
}

export function getOpenCategoryIds() {
  return readJson<string[]>(OPEN_CATEGORY_IDS_KEY, []);
}

export function setOpenCategoryIds(categoryIds: string[]) {
  writeJson(OPEN_CATEGORY_IDS_KEY, categoryIds);
}

export function getCategoryCursor(categoryId: string) {
  const map = readJson<Record<string, number>>(CATEGORY_CURSOR_KEY, {});
  const value = map[categoryId];
  if (typeof value !== "number" || value < 0) return 0;
  return Math.floor(value);
}

export function setCategoryCursor(categoryId: string, index: number) {
  const map = readJson<Record<string, number>>(CATEGORY_CURSOR_KEY, {});
  map[categoryId] = Math.max(0, Math.floor(index));
  writeJson(CATEGORY_CURSOR_KEY, map);
}
