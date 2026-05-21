import type { ConsentDefinition } from "./spec";

export const livenessConsentDefinitionSample: ConsentDefinition = {
  domain: "certificate",
  version: "v1",
  categories: [
    {
      id: "required-service",
      title: "[필수] 본인확인 서비스 이용 동의",
      required: true,
      terms: [
        {
          id: "face-collect",
          title: "안면인식 정보 수집·이용 동의",
          required: true,
          summary: "안면인식 기반 본인확인을 위한 필수 동의입니다.",
          content: [
            "본 동의서는 안면인식 기반 본인확인을 위해 필요한 최소한의 정보를 수집·이용하기 위한 내용입니다.",
            "수집 항목은 얼굴 이미지 및 생체인식 결과이며, 본인확인 목적 범위 내에서만 사용됩니다.",
            "보유기간은 본인확인 완료 후 지체 없이 파기하며, 법령에 따른 보관 의무가 있는 경우 해당 기간 동안 보관할 수 있습니다.",
          ],
        },
      ],
    },
  ],
};
