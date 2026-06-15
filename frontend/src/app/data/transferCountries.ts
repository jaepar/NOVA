export interface TransferCountry {
  id: string
  name: string
  nameKo: string
  nameEn: string
  englishName: string
  flag: string
  currencyCode: string
}

export const transferCountries: TransferCountry[] = [
  { id: 'kr', name: '한국', nameKo: '한국', nameEn: 'Republic of Korea', englishName: 'Republic of Korea', flag: '🇰🇷', currencyCode: 'KRW' },
  { id: 'us', name: '미국', nameKo: '미국', nameEn: 'United States', englishName: 'United States', flag: '🇺🇸', currencyCode: 'USD' },
  { id: 'jp', name: '일본', nameKo: '일본', nameEn: 'Japan', englishName: 'Japan', flag: '🇯🇵', currencyCode: 'JPY' },
  { id: 'cn', name: '중국', nameKo: '중국', nameEn: 'China', englishName: 'China', flag: '🇨🇳', currencyCode: 'CNY' },
  { id: 'vn', name: '베트남', nameKo: '베트남', nameEn: 'Vietnam', englishName: 'Vietnam', flag: '🇻🇳', currencyCode: 'VND' },
  { id: 'ph', name: '필리핀', nameKo: '필리핀', nameEn: 'Philippines', englishName: 'Philippines', flag: '🇵🇭', currencyCode: 'PHP' },
  { id: 'th', name: '태국', nameKo: '태국', nameEn: 'Thailand', englishName: 'Thailand', flag: '🇹🇭', currencyCode: 'THB' },
  { id: 'id', name: '인도네시아', nameKo: '인도네시아', nameEn: 'Indonesia', englishName: 'Indonesia', flag: '🇮🇩', currencyCode: 'IDR' },
  { id: 'in', name: '인도', nameKo: '인도', nameEn: 'India', englishName: 'India', flag: '🇮🇳', currencyCode: 'INR' },
  { id: 'uz', name: '우즈베키스탄', nameKo: '우즈베키스탄', nameEn: 'Uzbekistan', englishName: 'Uzbekistan', flag: '🇺🇿', currencyCode: 'USD' },
  { id: 'mn', name: '몽골', nameKo: '몽골', nameEn: 'Mongolia', englishName: 'Mongolia', flag: '🇲🇳', currencyCode: 'MNT' },
]

export const transferRemittanceCountries = transferCountries.filter(
  (country) => country.id !== 'kr'
)

export function getTransferCountryName(country: TransferCountry, language: string) {
  return language === 'en' ? country.nameEn : country.nameKo
}

export function formatTransferCountryName(country: TransferCountry, language: string) {
  const localizedName = getTransferCountryName(country, language)
  return language === 'en' ? localizedName : `${localizedName}(${country.englishName})`
}
