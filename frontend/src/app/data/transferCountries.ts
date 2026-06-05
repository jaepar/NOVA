export interface TransferCountry {
  id: string
  name: string
  englishName: string
  flag: string
  currencyCode: string
}

export const transferCountries: TransferCountry[] = [
  { id: 'kr', name: '한국', englishName: 'Republic of Korea', flag: '🇰🇷', currencyCode: 'KRW' },
  { id: 'us', name: '미국', englishName: 'United States', flag: '🇺🇸', currencyCode: 'USD' },
  { id: 'jp', name: '일본', englishName: 'Japan', flag: '🇯🇵', currencyCode: 'JPY' },
  { id: 'cn', name: '중국', englishName: 'China', flag: '🇨🇳', currencyCode: 'CNY' },
  { id: 'vn', name: '베트남', englishName: 'Vietnam', flag: '🇻🇳', currencyCode: 'VND' },
  { id: 'ph', name: '필리핀', englishName: 'Philippines', flag: '🇵🇭', currencyCode: 'PHP' },
  { id: 'th', name: '태국', englishName: 'Thailand', flag: '🇹🇭', currencyCode: 'THB' },
  { id: 'id', name: '인도네시아', englishName: 'Indonesia', flag: '🇮🇩', currencyCode: 'IDR' },
  { id: 'in', name: '인도', englishName: 'India', flag: '🇮🇳', currencyCode: 'INR' },
  { id: 'uz', name: '우즈베키스탄', englishName: 'Uzbekistan', flag: '🇺🇿', currencyCode: 'USD' },
  { id: 'mn', name: '몽골', englishName: 'Mongolia', flag: '🇲🇳', currencyCode: 'MNT' },
]
