import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CloseButtonTemplate } from "../common/CloseButtonTemplate";
import { useStep10TermsPageStore } from "../../stores/pageStores";

const termDetails = [
  {
    id: "face-collect",
    title: "개인(신용)정보 수집·이용 동의서",
    content: [
      "본 동의서는 안면인식 기반 본인확인을 위해 필요한 최소한의 정보를 수집·이용하기 위한 것입니다.",
      "수집 항목은 얼굴 이미지 및 생체인증 결과값(특징점)이며, 본인확인 목적 범위 내에서만 사용됩니다.",
      "보관기간은 본인확인 완료 후 즉시 파기를 원칙으로 하며, 법령에 따른 보관의무가 있는 경우 해당 기간 보관될 수 있습니다.",
    ],
  },
] as const;

export function Step10TermDetail() {
  const navigate = useNavigate();
  const { termId } = useParams();
  const checkedTermIds = useStep10TermsPageStore((state) => state.checkedTermIds);
  const setCheckedTermIds = useStep10TermsPageStore((state) => state.setCheckedTermIds);

  const term = useMemo(() => termDetails.find((item) => item.id === termId) ?? null, [termId]);
  const isChecked = Boolean(termId && checkedTermIds.includes(termId));

  if (!term) {
    return (
      <CloseButtonTemplate
        headerTitle="약관/동의서 상세"
        onClose={() => navigate("/certificate/step-10", { state: { preserveStep10State: true } })}
      >
        <div className="pt-10 text-center">약관을 찾을 수 없습니다.</div>
      </CloseButtonTemplate>
    );
  }

  return (
    <CloseButtonTemplate
      headerTitle="약관/동의서 상세"
      onClose={() => navigate("/certificate/step-10", { state: { preserveStep10State: true } })}
      showBottomButton
      buttonText={isChecked ? "확인" : "동의하기"}
      onButtonClick={() => {
        if (termId && !checkedTermIds.includes(termId)) {
          setCheckedTermIds([...checkedTermIds, termId]);
        }
        navigate("/certificate/step-10", { state: { preserveStep10State: true } });
      }}
    >
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{term.title}</h2>
        {term.content.map((line) => (
          <p key={line} className="text-sm text-foreground/90 leading-relaxed">
            {line}
          </p>
        ))}
      </div>
    </CloseButtonTemplate>
  );
}
