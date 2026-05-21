export interface TermItem {
  id: string;
  title: string;
  required: boolean;
  summary: string;
  content: string[];
}

export interface TermCategory {
  id: string;
  title: string;
  required: boolean;
  items: TermItem[];
}

export const termCategories: TermCategory[] = [
  {
    id: "required-service",
    title: "[필수] 서비스 가입 동의",
    required: true,
    items: [
      {
        id: "electronic-finance-basic",
        title: "전자금융거래 기본약관",
        required: true,
        summary: "전자금융 서비스 이용을 위한 기본 권리, 의무, 책임 범위를 규정합니다.",
        content: [
          "본 약관은 NOVA 전자금융 서비스 이용 시 적용됩니다.",
          "이용자는 본인 명의 계정과 인증수단을 안전하게 관리해야 합니다.",
          "거래 처리 결과는 서비스 내 고지 및 알림 수단을 통해 안내됩니다.",
          "시스템 점검 또는 장애 시 일부 서비스 이용이 제한될 수 있습니다.",
        ],
      },
      {
        id: "electronic-finance-usage",
        title: "전자뱅킹서비스 이용약관",
        required: true,
        summary: "조회, 이체, 거래내역 등 금융 기능 이용 조건을 안내합니다.",
        content: [
          "전자뱅킹 서비스는 인증 완료된 사용자에게 제공됩니다.",
          "이체 한도와 이용 가능 시간은 정책에 따라 달라질 수 있습니다.",
          "비정상 거래 의심 시 보안을 위해 거래가 제한될 수 있습니다.",
          "서비스 변경 사항은 사전 공지 후 적용됩니다.",
        ],
      },
      {
        id: "personal-credit-check",
        title: "개인(신용)정보 수집·이용 동의서(수신 등)",
        required: true,
        summary: "신용/거래 관련 정보 수집 및 이용 목적과 보관 기간을 설명합니다.",
        content: [
          "서비스 제공을 위해 필요한 범위 내에서 정보가 수집됩니다.",
          "수집 정보는 본인 확인, 계약 이행, 민원 처리에 사용됩니다.",
          "법령 또는 내부 정책에 따라 보관 기간이 적용됩니다.",
          "동의 거부 시 일부 금융 서비스 이용이 제한될 수 있습니다.",
        ],
      },
      {
        id: "customer-rights",
        title: "고객정보 취급방침",
        required: true,
        summary: "고객 정보의 보호 원칙, 접근 통제, 파기 절차를 안내합니다.",
        content: [
          "고객 정보는 최소 권한 원칙에 따라 접근이 제한됩니다.",
          "전송 및 저장 구간에서 보안 조치를 적용합니다.",
          "이용 목적 달성 후에는 지체 없이 파기 절차를 진행합니다.",
          "정보 주체는 열람, 정정, 삭제 요청 권리를 가집니다.",
        ],
      },
    ],
  },
  {
    id: "optional-marketing",
    title: "[선택] 마케팅 활용 동의",
    required: false,
    items: [
      {
        id: "marketing-consent",
        title: "개인(신용)정보 수집·이용·제공 동의서(상품 서비스 안내 등)",
        required: false,
        summary: "혜택, 이벤트, 맞춤형 금융상품 안내를 위한 선택 동의 항목입니다.",
        content: [
          "동의 시 문자, 앱 푸시, 이메일로 혜택 정보를 받을 수 있습니다.",
          "동의하지 않아도 기본 서비스 이용에는 제한이 없습니다.",
          "동의 후에도 설정 화면에서 언제든 철회할 수 있습니다.",
        ],
      },
    ],
  },
  {
    id: "optional-cloud",
    title: "[선택] 클라우드 저장 동의",
    required: false,
    items: [
      {
        id: "cloud-storage-consent",
        title: "신원확인 서류 클라우드 저장 동의",
        required: false,
        summary: "신원 확인 관련 서류를 안전하게 보관하기 위한 선택 동의 항목입니다.",
        content: [
          "제출 서류는 암호화된 저장소에 보관됩니다.",
          "보관 기간은 법령 및 내부 정책에 따라 운영됩니다.",
          "동의하지 않아도 대체 절차를 통해 서비스 이용이 가능합니다.",
        ],
      },
    ],
  },
];

export function findTermById(termId: string) {
  for (const category of termCategories) {
    const found = category.items.find((item) => item.id === termId);
    if (found) return found;
  }
  return null;
}

export function findCategoryById(categoryId: string) {
  return termCategories.find((category) => category.id === categoryId) ?? null;
}

const AGREED_TERM_IDS_STORAGE_KEY = "certificate_step1_agreed_term_ids";
const CATEGORY_CAROUSEL_INDEX_STORAGE_KEY = "certificate_step1_category_carousel_index";
const OPEN_CATEGORY_IDS_STORAGE_KEY = "certificate_step1_open_category_ids";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function getAgreedTermIds() {
  if (!canUseStorage()) return new Set<string>();

  const raw = window.sessionStorage.getItem(AGREED_TERM_IDS_STORAGE_KEY);
  if (!raw) return new Set<string>();

  try {
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set(parsed);
  } catch {
    return new Set<string>();
  }
}

export function setAgreedTermIds(termIds: Set<string>) {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(AGREED_TERM_IDS_STORAGE_KEY, JSON.stringify(Array.from(termIds)));
}

export function markTermAgreed(termId: string) {
  const next = getAgreedTermIds();
  next.add(termId);
  setAgreedTermIds(next);
}

export function markTermsAgreed(termIds: string[]) {
  const next = getAgreedTermIds();
  for (const termId of termIds) {
    next.add(termId);
  }
  setAgreedTermIds(next);
}

export function getCategoryCarouselIndex(categoryId: string) {
  if (!canUseStorage()) return 0;
  const raw = window.sessionStorage.getItem(CATEGORY_CAROUSEL_INDEX_STORAGE_KEY);
  if (!raw) return 0;

  try {
    const parsed = JSON.parse(raw) as Record<string, number>;
    const value = parsed?.[categoryId];
    if (typeof value !== "number" || value < 0) return 0;
    return Math.floor(value);
  } catch {
    return 0;
  }
}

export function setCategoryCarouselIndex(categoryId: string, index: number) {
  if (!canUseStorage()) return;

  let map: Record<string, number> = {};
  const raw = window.sessionStorage.getItem(CATEGORY_CAROUSEL_INDEX_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, number>;
      if (parsed && typeof parsed === "object") map = parsed;
    } catch {
      map = {};
    }
  }

  map[categoryId] = Math.max(0, Math.floor(index));
  window.sessionStorage.setItem(CATEGORY_CAROUSEL_INDEX_STORAGE_KEY, JSON.stringify(map));
}

export function getOpenCategoryIds() {
  if (!canUseStorage()) return [] as string[];
  const raw = window.sessionStorage.getItem(OPEN_CATEGORY_IDS_STORAGE_KEY);
  if (!raw) return [] as string[];

  try {
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) return [] as string[];
    return parsed.filter((value) => typeof value === "string");
  } catch {
    return [] as string[];
  }
}

export function setOpenCategoryIds(categoryIds: string[]) {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(OPEN_CATEGORY_IDS_STORAGE_KEY, JSON.stringify(categoryIds));
}
