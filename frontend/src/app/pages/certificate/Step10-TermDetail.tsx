import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CloseButtonTemplate } from "../common/CloseButtonTemplate";
import { useStep10TermsPageStore } from "../../stores/pageStores";

const termDetails = [
  {
    id: "face-collect",
    title: "안면인식 정보 수집·이용 동의서",
    summary: "안면인식 기반 본인확인을 위한 필수 동의입니다.",
    content: [
      "본 동의서는 안면인식 기반 본인확인을 위해 필요한 최소한의 정보를 수집·이용하기 위한 내용입니다.",
      "수집 항목은 얼굴 이미지 및 생체인식 결과이며, 본인확인 목적 범위 내에서만 사용됩니다.",
      "보유기간은 본인확인 완료 후 지체 없이 파기하며, 법령에 따른 보관 의무가 있는 경우 해당 기간 동안 보관될 수 있습니다.",
    ],
  },
] as const;

export function Step10TermDetail() {
  const navigate = useNavigate();
  const { termId } = useParams();
  const checkedTermIds = useStep10TermsPageStore((state) => state.checkedTermIds);
  const setCheckedTermIds = useStep10TermsPageStore((state) => state.setCheckedTermIds);

  const term = useMemo(() => termDetails.find((item) => item.id === termId) ?? null, [termId]);

  if (!term) {
    return (
      <CloseButtonTemplate
        headerTitle="약관/동의서 상세"
        onClose={() => navigate("/certificate/step-10", { state: { preserveStep10State: true } })}
      >
        <div className="space-y-3 text-center pt-10">
          <h2 className="text-xl font-semibold">약관을 찾을 수 없어요</h2>
          <p className="text-muted-foreground">다시 선택해 주세요</p>
        </div>
      </CloseButtonTemplate>
    );
  }

  return (
    <CloseButtonTemplate
      headerTitle="약관/동의서 상세"
      onClose={() => navigate("/certificate/step-10", { state: { preserveStep10State: true } })}
      showBottomButton
      buttonText="동의하기"
      onButtonClick={() => {
        if (termId && !checkedTermIds.includes(termId)) {
          setCheckedTermIds([...checkedTermIds, termId]);
        }
        navigate("/certificate/step-10", { state: { preserveStep10State: true } });
      }}
    >
      <div className="space-y-6 pb-4">
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">{term.title}</h2>
          <p className="text-muted-foreground leading-relaxed">{term.summary}</p>
        </section>

        <section className="space-y-3">
          {term.content.map((paragraph, index) => (
            <p key={`${term.id}-${index}`} className="text-sm leading-relaxed text-foreground/90">
              {paragraph}
            </p>
          ))}
        </section>
      </div>
    </CloseButtonTemplate>
  );
}
