export interface TransferCurrency {
  code: string
  name: string
  symbol: string
  flag: string
}

export const transferCurrencies: TransferCurrency[] = [
  { code: 'KRW', name: '대한민국 원', symbol: '₩', flag: '🇰🇷' },
  { code: 'USD', name: '미국 달러', symbol: '$', flag: '🇺🇸' },
  { code: 'JPY', name: '일본 엔', symbol: '¥', flag: '🇯🇵' },
  { code: 'CNY', name: '중국 위안', symbol: '¥', flag: '🇨🇳' },
  { code: 'VND', name: '베트남 동', symbol: '₫', flag: '🇻🇳' },
  { code: 'PHP', name: '필리핀 페소', symbol: '₱', flag: '🇵🇭' },
  { code: 'THB', name: '태국 바트', symbol: '฿', flag: '🇹🇭' },
  { code: 'IDR', name: '인도네시아 루피아', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'INR', name: '인도 루피', symbol: '₹', flag: '🇮🇳' },
  { code: 'MNT', name: '몽골 투그릭', symbol: '₮', flag: '🇲🇳' },
]
