export interface TransferSwiftLookupItem {
  id: string
  countryId: string
  swiftCode: string
  bankName: string
  branchName: string
  city: string
  routingNumber: string
}

export const transferSwiftLookupItems: TransferSwiftLookupItem[] = [
  {
    id: 'us-citi-newyork',
    countryId: 'us',
    swiftCode: 'CITIUS33XXX',
    bankName: 'CITIBANK N.A.',
    branchName: 'NEW YORK MAIN',
    city: 'NEW YORK',
    routingNumber: '021000089',
  },
  {
    id: 'us-bofa-newyork',
    countryId: 'us',
    swiftCode: 'BOFAUS3NXXX',
    bankName: 'BANK OF AMERICA',
    branchName: 'MANHATTAN CENTER',
    city: 'NEW YORK',
    routingNumber: '026009593',
  },
  {
    id: 'jp-smbc-tokyo',
    countryId: 'jp',
    swiftCode: 'SMBCJPJTXXX',
    bankName: 'SUMITOMO MITSUI BANKING CORPORATION',
    branchName: 'TOKYO MAIN',
    city: 'TOKYO',
    routingNumber: '',
  },
  {
    id: 'cn-boc-beijing',
    countryId: 'cn',
    swiftCode: 'BKCHCNBJXXX',
    bankName: 'BANK OF CHINA',
    branchName: 'BEIJING MAIN',
    city: 'BEIJING',
    routingNumber: '',
  },
]
