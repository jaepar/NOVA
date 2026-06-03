import type { ConsentDefinition } from "../spec";

export const transferConsentDefinition: ConsentDefinition = {
  domain: "transfer",
  version: "v1",
  categories: [
    {
      id: "transfer-required-consent",
      title: "[필수] 해외송금 필수 동의",
      required: true,
      terms: [
        {
          id: "transfer-usage-guide",
          title: "해외송금 이용안내 및 유의사항",
          required: true,
          summary: "해외송금 서비스 이용 전 반드시 확인해야 하는 안내입니다.",
          content: [
            "해외송금은 수취 국가, 통화, 송금 목적에 따라 처리 가능 여부와 소요 시간이 달라질 수 있습니다.",
            "입력한 수취인 정보가 실제 정보와 다를 경우 송금이 지연되거나 반려될 수 있습니다.",
            "송금 요청 후에도 관련 법령, 내부 심사, 제재 목록 확인 결과에 따라 거래가 제한될 수 있습니다.",
          ],
        },
        {
          id: "foreign-exchange-terms",
          title: "외환거래 기본약관",
          required: true,
          summary: "외환거래 서비스 이용에 적용되는 기본 약관입니다.",
          content: [
            "해외송금 거래에는 외국환거래법, 전자금융거래법 및 회사의 외환업무 기준이 적용됩니다.",
            "적용 환율, 수수료, 송금 가능 시간과 한도는 거래 시점의 정책에 따라 달라질 수 있습니다.",
            "이용자는 거래 전 표시된 환율, 수수료, 예상 수취금액을 확인한 뒤 송금을 진행해야 합니다.",
          ],
        },
        {
          id: "restricted-country-check",
          title: "송금제한 국가 관련 확인사항",
          required: true,
          summary: "제재 국가 및 송금 제한 국가 여부를 확인하기 위한 필수 안내입니다.",
          content: [
            "국제 제재, 현지 규제, 내부 통제 기준에 따라 일부 국가 또는 지역으로의 송금은 제한될 수 있습니다.",
            "수취 국가가 제한 대상에 해당하는 경우 거래가 거절되거나 추가 서류 제출이 요청될 수 있습니다.",
            "이용자는 송금 목적과 수취 국가의 규제를 준수해야 하며, 허위 정보 입력 시 거래가 취소될 수 있습니다.",
          ],
        },
      ],
    },
  ],
};
