export interface TransferCurrency {
  code: string
  name: string
  nameKo: string
  nameEn: string
  symbol: string
  flag: string
}

export const transferCurrencies: TransferCurrency[] = [
  { code: 'KRW', name: '대한민국 원', nameKo: '대한민국 원', nameEn: 'Korean won', symbol: '₩', flag: '🇰🇷' },
  { code: 'USD', name: '미국 달러', nameKo: '미국 달러', nameEn: 'US dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'JPY', name: '일본 엔', nameKo: '일본 엔', nameEn: 'Japanese yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CNY', name: '중국 위안', nameKo: '중국 위안', nameEn: 'Chinese yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'VND', name: '베트남 동', nameKo: '베트남 동', nameEn: 'Vietnamese dong', symbol: '₫', flag: '🇻🇳' },
  { code: 'PHP', name: '필리핀 페소', nameKo: '필리핀 페소', nameEn: 'Philippine peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'THB', name: '태국 바트', nameKo: '태국 바트', nameEn: 'Thai baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'IDR', name: '인도네시아 루피아', nameKo: '인도네시아 루피아', nameEn: 'Indonesian rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'INR', name: '인도 루피', nameKo: '인도 루피', nameEn: 'Indian rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'MNT', name: '몽골 투그릭', nameKo: '몽골 투그릭', nameEn: 'Mongolian tugrik', symbol: '₮', flag: '🇲🇳' },
]

export function getTransferCurrencyName(currency: TransferCurrency, language: string) {
  return language === 'en' ? currency.nameEn : currency.nameKo
}
