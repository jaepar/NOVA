import type { ConsentDefinition } from '../spec'

export const certificateConsentDefinition: ConsentDefinition = {
  domain: 'certificate',
  version: 'v1',
  categories: [
    {
      id: 'required-service',
      title: '[필수] 서비스 가입 동의',
      required: true,
      terms: [
        {
          id: 'electronic-finance-basic',
          title: '전자금융거래 기본약관',
          required: true,
          summary: '전자금융 서비스 이용을 위한 기본 약관입니다.',
          content: ['본 약관은 예시 텍스트입니다.', '실제 운영 약관으로 교체해서 사용하세요.'],
        },
        {
          id: 'privacy-required',
          title: '개인정보 수집·이용 동의서',
          required: true,
          summary: '서비스 제공을 위한 필수 개인정보 처리 동의입니다.',
          content: ['본 동의서는 샘플입니다.', '실제 서비스 정책에 맞게 문구를 교체하세요.'],
        },
        {
          id: 'identity-required',
          title: '신원확인 및 본인인증 동의서',
          required: true,
          summary: '금융 서비스 이용을 위한 본인 확인 절차 동의입니다.',
          content: ['본 항목은 샘플 텍스트입니다.', '운영 정책 확정 후 실제 약관으로 대체하세요.'],
        },
      ],
    },
    {
      id: 'optional-marketing-1',
      title: '[선택] 마케팅 활용 동의 1',
      required: false,
      terms: [
        {
          id: 'marketing-consent-1',
          title: '마케팅 정보 수신 동의',
          required: false,
          summary: '혜택 및 이벤트 안내를 위한 선택 동의입니다.',
          content: ['본 문구는 예시입니다.'],
        },
      ],
    },
    {
      id: 'optional-marketing-2',
      title: '[선택] 마케팅 활용 동의 2',
      required: false,
      terms: [
        {
          id: 'marketing-consent-2a',
          title: '맞춤형 상품 추천 동의',
          required: false,
          summary: '고객 맞춤형 혜택 안내를 위한 선택 동의입니다.',
          content: ['본 문구는 예시입니다.'],
        },
        {
          id: 'marketing-consent-2b',
          title: '제휴 서비스 안내 동의',
          required: false,
          summary: '제휴 서비스/이벤트 정보를 받기 위한 선택 동의입니다.',
          content: ['본 문구는 예시입니다.'],
        },
      ],
    },
  ],
}
