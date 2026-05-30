import type { ConsentDefinition } from '../spec'

export const accountOpenConsentDefinition: ConsentDefinition = {
  domain: 'account',
  version: 'v1',
  categories: [
    {
      id: 'required-open-account',
      title: '[필수] 계좌 개설 필수 동의',
      required: true,
      terms: [
        {
          id: 'account-open-agreement',
          title: '[필수] 입출금이자율운용 동의약관',
          required: true,
          summary: '입출금 통장 개설 및 운용을 위한 기본 약관입니다.',
          content: [
            '입출금계좌 개설 및 이용에 필요한 기본 조건, 적용 이율, 거래 제한사항을 안내합니다.',
            '법령 및 내부 기준 변경 시 약관이 개정될 수 있으며, 개정 내용은 사전 고지됩니다.',
          ],
        },
        {
          id: 'realname-verification-consent',
          title: '[필수] 비대면 계좌개설 안심차단 등록 여부 조회를 위한 개인정보 동의서',
          required: true,
          summary: '비대면 실명확인 및 안심차단 여부 확인을 위한 필수 동의입니다.',
          content: [
            '관계 법령에 따라 비대면 계좌개설 시 본인확인 및 안심차단 등록 여부 조회가 수행됩니다.',
            '조회 목적 외로 개인정보를 사용하지 않으며, 관련 법령이 정한 기간 동안만 보관됩니다.',
          ],
        },
        {
          id: 'major-notice',
          title: '[필수] 상품 주요내용 안내',
          required: true,
          summary: '상품 핵심 조건 및 유의사항 확인을 위한 필수 안내입니다.',
          content: [
            '이체 한도, 이용 수수료, 거래 제한 조건 등 상품 주요 내용을 반드시 확인해 주세요.',
            '중요 사항 미확인으로 발생한 불이익은 이용자에게 귀속될 수 있습니다.',
          ],
        },
      ],
    },
    {
      id: 'optional-open-account',
      title: '[선택] 추가 안내 및 고지',
      required: false,
      terms: [
        {
          id: 'product-summary',
          title: '상품약관_우리 SUPER주거래 통장',
          required: false,
          summary: '상품별 세부 약관입니다.',
          content: [
            '우리 SUPER주거래 통장 상품의 세부 이용조건, 부가혜택, 거래 제한사항을 안내합니다.',
          ],
        },
        {
          id: 'product-description',
          title: '상품설명서_우리 SUPER주거래 통장',
          required: false,
          summary: '상품 설명서 및 이용자 유의사항입니다.',
          content: ['상품 특성, 수수료 구조, 해지 절차 등 이용자 안내사항을 제공합니다.'],
        },
        {
          id: 'deposit-protection',
          title: '예금자보호법 설명확인',
          required: false,
          summary: '예금자보호 적용 범위 안내입니다.',
          content: [
            '예금자보호 대상 및 보호 한도는 예금자보호법에 따라 적용됩니다.',
            '보호 제외 상품 또는 조건이 있을 수 있으니 상세 내용을 확인해 주세요.',
          ],
        },
        {
          id: 'financial-product-guide',
          title: '금융거래 공통 확인사항',
          required: false,
          summary: '금융거래 시 공통으로 확인해야 할 항목입니다.',
          content: ['전자금융 이용, 사고 신고, 분쟁 처리 절차 등 공통 확인사항을 안내합니다.'],
        },
        {
          id: 'illegal-account-prevention',
          title: '불법·탈법 자금거래 금지 설명 확인서',
          required: false,
          summary: '불법 자금거래 방지 안내입니다.',
          content: [
            '금융사기, 자금세탁 등 불법·탈법 목적 거래는 금지되며 관련 법령에 따라 조치될 수 있습니다.',
          ],
        },
        {
          id: 'privacy-policy',
          title: '고객정보 취급방침',
          required: false,
          summary: '개인정보 처리 및 보호 정책 안내입니다.',
          content: ['수집 정보의 이용 목적, 보관 기간, 제3자 제공 기준 등 처리방침을 안내합니다.'],
        },
      ],
    },
  ],
}

