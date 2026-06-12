import type { ConsentDefinition } from "../spec";

export const signupConsentDefinition: ConsentDefinition = {
  domain: "signup",
  version: "v1",
  categories: [
    {
      id: "signup-required",
      title: "[필수] 회원가입 필수 약관",
      required: true,
      terms: [
        {
          id: "signup-service-terms",
          title: "서비스 이용 약관",
          required: true,
          summary: "NOVA 서비스 이용을 위한 필수 약관입니다.",
          content: [
            "본 약관은 NOVA가 제공하는 비대면 금융 및 생활 서비스 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 정하기 위한 문서입니다.",
            "회원은 서비스 가입 후 본인 확인, 계좌 개설 보조, 금융 생활 지원 등 NOVA가 제공하는 기능을 이용할 수 있습니다.",
            "실제 운영 약관은 서비스 정책 확정 후 본 문구를 대체하여 적용합니다.",
          ],
        },
        {
          id: "signup-privacy-consent",
          title: "개인정보 수집 및 이용 동의",
          required: true,
          summary: "회원 등록과 서비스 제공을 위한 필수 개인정보 처리 동의입니다.",
          content: [
            "회사는 회원가입 및 서비스 제공을 위해 이름, 이메일, 생년월일, 성별 등 최소한의 개인정보를 수집 및 이용합니다.",
            "수집된 정보는 회원 관리, 서비스 제공, 고객 지원, 보안 및 부정 이용 방지 목적으로 사용됩니다.",
            "실제 개인정보 처리 문구와 보관 기간은 운영 정책 및 법무 검토 결과에 맞게 교체합니다.",
          ],
        },
      ],
    },
    {
      id: "signup-optional",
      title: "[선택] 마케팅 정보 수신 동의",
      required: false,
      terms: [
        {
          id: "signup-marketing-consent",
          title: "마케팅 정보 수신 동의",
          required: false,
          summary: "혜택, 이벤트, 신규 서비스 안내를 받기 위한 선택 동의입니다.",
          content: [
            "회사는 이벤트, 프로모션, 맞춤 혜택 및 신규 서비스 안내를 이메일 또는 앱 알림 형식으로 제공할 수 있습니다.",
            "본 동의는 선택 사항이며, 동의하지 않아도 NOVA 서비스 가입과 이용에는 제한이 없습니다.",
          ],
        },
      ],
    },
  ],
};

