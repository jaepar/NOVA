const range = (start: number, end: number): string[] =>
  Array.from({ length: end - start + 1 }, (_, index) => String(start + index))

const NONGHYUP_LEGACY_SUBJECTS = [
  '01',
  '02',
  '12',
  '06',
  '05',
  '17',
  '04',
  '10',
  '14',
  '21',
  '24',
  '34',
  '45',
  '47',
  '49',
  '59',
  '80',
  '28',
  '31',
  '43',
  '46',
  '79',
  '81',
  '86',
  '87',
  '88',
] as const

const NONGHYUP_PRODUCT_PREFIXES = [
  '301',
  '302',
  '312',
  '306',
  '305',
  '317',
  '304',
  '310',
  '314',
  '321',
  '324',
  '334',
  '345',
  '347',
  '349',
  '359',
  '380',
  '028',
  '031',
  '043',
  '046',
  '079',
  '081',
  '086',
  '087',
  '088',
  '351',
  '352',
  '353',
  '354',
  '356',
  '360',
  '384',
] as const

export interface AccountRule {
  length: number
  subStart: number
  subLen: number
  subjects: readonly string[]
}

export interface BankPluginData {
  id: string
  bankName: string
  rules: readonly AccountRule[]
}

export interface TransferBankOption {
  id: string
  name: string
}

export interface DetectionResult {
  bankId: string
  bankName: string
  score: number
}

export const BANK_PLUGINS_DATA: readonly BankPluginData[] = [
  {
    id: 'woori',
    bankName: '우리은행',
    rules: [
      { length: 13, subStart: 1, subLen: 3, subjects: ['006', '007', '002', '004', '003', '005'] },
      {
        length: 14,
        subStart: 9,
        subLen: 2,
        subjects: ['18', '92', '01', '15', '02', '12', '04', '03', '13'],
      },
      { length: 11, subStart: 3, subLen: 2, subjects: ['05', '06', '07', '08', '02', '01', '04'] },
      {
        length: 14,
        subStart: 3,
        subLen: 2,
        subjects: ['01', '15', '02', '12', '04', '03', '13'],
      },
      { length: 12, subStart: 3, subLen: 2, subjects: ['01', '21', '24', '05', '04', '25', '09'] },
    ],
  },
  {
    id: 'shinhan',
    bankName: '신한은행',
    rules: [
      { length: 12, subStart: 0, subLen: 3, subjects: [...range(100, 161), '268', '269', '298'] },
      {
        length: 11,
        subStart: 3,
        subLen: 2,
        subjects: ['01', '09', '61', '04', '05', '06', '08', '02', '07', '03', '11', '12', '13', '99'],
      },
      { length: 13, subStart: 3, subLen: 2, subjects: ['81', '82'] },
      { length: 14, subStart: 0, subLen: 3, subjects: ['560', '561', '562'] },
      { length: 14, subStart: 3, subLen: 3, subjects: ['901'] },
    ],
  },
  {
    id: 'kb',
    bankName: 'KB국민은행',
    rules: [
      { length: 12, subStart: 3, subLen: 2, subjects: ['01', '05', '04', '21', '24', '25', '26'] },
      { length: 12, subStart: 4, subLen: 2, subjects: ['06', '18'] },
      { length: 14, subStart: 4, subLen: 2, subjects: ['92', '01', '02', '25', '37', '90'] },
      { length: 10, subStart: 0, subLen: 0, subjects: [] },
      { length: 11, subStart: 0, subLen: 0, subjects: [] },
    ],
  },
  {
    id: 'hana',
    bankName: '하나은행',
    rules: [
      { length: 12, subStart: 0, subLen: 3, subjects: ['611', '620', '600', '601', '630', '610', '621', '631'] },
      { length: 11, subStart: 3, subLen: 2, subjects: ['13', '33', '18', '19', '26', '11', '22', '38', '39'] },
      { length: 14, subStart: 12, subLen: 2, subjects: ['05', '07', '08', '02', '01', '04', '94', '37', '60'] },
    ],
  },
  {
    id: 'ibk',
    bankName: 'IBK기업은행',
    rules: [
      { length: 14, subStart: 9, subLen: 2, subjects: ['01', '02', '03', '13', '07', '06', '04'] },
      { length: 12, subStart: 3, subLen: 2, subjects: ['01', '02', '03', '13', '07', '06', '04'] },
      { length: 10, subStart: 0, subLen: 0, subjects: [] },
      { length: 11, subStart: 0, subLen: 0, subjects: [] },
    ],
  },
  {
    id: 'nonghyup',
    bankName: 'NH농협은행',
    rules: [
      {
        length: 11,
        subStart: 3,
        subLen: 2,
        subjects: NONGHYUP_LEGACY_SUBJECTS,
      },
      {
        length: 12,
        subStart: 4,
        subLen: 2,
        subjects: NONGHYUP_LEGACY_SUBJECTS,
      },
      {
        length: 12,
        subStart: 3,
        subLen: 2,
        subjects: NONGHYUP_LEGACY_SUBJECTS,
      },
      {
        length: 13,
        subStart: 0,
        subLen: 3,
        subjects: NONGHYUP_PRODUCT_PREFIXES,
      },
      { length: 14, subStart: 6, subLen: 2, subjects: ['64', '65'] },
      { length: 14, subStart: 0, subLen: 3, subjects: NONGHYUP_PRODUCT_PREFIXES },
      { length: 14, subStart: 0, subLen: 3, subjects: ['790', '791', '792'] },
    ],
  },
  {
    id: 'busan',
    bankName: '부산은행',
    rules: [],
  },
  {
    id: 'kakao',
    bankName: '카카오뱅크',
    rules: [],
  },
  {
    id: 'toss',
    bankName: '토스뱅크',
    rules: [],
  },
  {
    id: 'sc',
    bankName: 'SC제일은행',
    rules: [],
  },
  {
    id: 'kbank',
    bankName: '케이뱅크',
    rules: [],
  },
  {
    id: 'suhyup',
    bankName: '수협은행',
    rules: [],
  },
]

export const TRANSFER_BANK_OPTIONS: TransferBankOption[] = BANK_PLUGINS_DATA.map(
  ({ id, bankName }) => ({
    id,
    name: bankName,
  })
)

const MIN_DETECTION_LENGTH = 8

function cleanAccountNumber(accountNumber: string): string {
  return String(accountNumber || '').replace(/\D/g, '')
}

function evaluateRule(cleanNumber: string, rule: AccountRule): number {
  const accountLen = cleanNumber.length

  if (accountLen > rule.length) return 0

  let score = accountLen === rule.length ? 0.5 : accountLen / rule.length / 10

  if (!rule.subLen) {
    return accountLen === rule.length ? score + 0.5 : score
  }

  const subjectEnd = rule.subStart + rule.subLen
  const enteredSubjectDigits = cleanNumber.slice(rule.subStart, Math.min(accountLen, subjectEnd))

  if (!enteredSubjectDigits) return score

  const matchesSubject = rule.subjects.some((subject) => subject.startsWith(enteredSubjectDigits))

  if (!matchesSubject) return 0

  if (enteredSubjectDigits.length === rule.subLen) {
    score += rule.subLen * 5
  } else {
    score += enteredSubjectDigits.length * 2
  }

  return score
}

export class GenerateDetector {
  constructor(
    private readonly bankId: string,
    private readonly bankName: string,
    private readonly accountRules: readonly AccountRule[]
  ) {}

  evaluate(accountNumber: string): DetectionResult {
    const cleanNumber = cleanAccountNumber(accountNumber)
    const score = this.accountRules.reduce(
      (bestScore, rule) => Math.max(bestScore, evaluateRule(cleanNumber, rule)),
      0
    )

    return {
      bankId: this.bankId,
      bankName: this.bankName,
      score,
    }
  }
}

export class AccountNumberDetector {
  private readonly detectors: GenerateDetector[]

  constructor(bankData: readonly BankPluginData[] = BANK_PLUGINS_DATA) {
    this.detectors = bankData.map(
      (data) => new GenerateDetector(data.id, data.bankName, data.rules)
    )
  }

  detectAccountNumber(accountNumber: string): DetectionResult[] {
    const cleanNumber = cleanAccountNumber(accountNumber)

    if (cleanNumber.length < MIN_DETECTION_LENGTH) return []

    return this.detectors
      .map((detector) => detector.evaluate(cleanNumber))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score || a.bankName.localeCompare(b.bankName, 'ko-KR'))
  }
}

const detectorSystem = new AccountNumberDetector()

export function detectAccountNumber(accountNumber: string): DetectionResult[] {
  return detectorSystem.detectAccountNumber(accountNumber)
}
