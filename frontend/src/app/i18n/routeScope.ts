const INCLUDED_ROUTE_PREFIXES = [
  "/",
  "/home",
  "/landing",
  "/language",
  "/main",
  "/exchange",
  "/login",
  "/signup",
  "/certificate",
  "/account",
  "/foreigner-card",
  "/transfer",
  "/global-transfer",
  "/transaction-history",
  "/mypage",
  "/notifications",
] as const;

const EXCLUDED_ROUTE_PREFIXES = [
  "/wallet",
  "/jobs",
  "/hospital-chat",
  "/design-system",
] as const;

export const i18nRouteScope = {
  included: INCLUDED_ROUTE_PREFIXES,
  excluded: EXCLUDED_ROUTE_PREFIXES,
  notes: {
    main:
      "Translate the full main UI, including entry cards for MyWallet, jobs, and hospital reservation.",
    excluded:
      "Do not translate MyWallet, job detail/apply/list pages, or hospital reservation detail/chat pages in the first pass.",
    data:
      "Do not translate server/content data such as company names, job descriptions, hospital names, addresses, or user-entered text.",
  },
} as const;

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isI18nExcludedRoute(pathname: string) {
  return EXCLUDED_ROUTE_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

export function isI18nIncludedRoute(pathname: string) {
  if (isI18nExcludedRoute(pathname)) {
    return false;
  }

  return INCLUDED_ROUTE_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}
