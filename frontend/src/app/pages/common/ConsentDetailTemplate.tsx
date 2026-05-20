import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CloseButtonTemplate } from "../common/CloseButtonTemplate";
import { certificateConsentDefinitionSample } from "../../domains/certificate-consent/definition.sample";
import { findTerm } from "../../domains/certificate-consent/spec";
import { getAgreedTermIds, markTermAgreed } from "../../domains/certificate-consent/storage";

export function ConsentDetailTemplate() {
  const navigate = useNavigate();
  const { termId } = useParams();

  const term = useMemo(() => (termId ? findTerm(certificateConsentDefinitionSample, termId) : null), [termId]);
  const categoryTermCount = useMemo(() => {
    if (!termId) return 0;
    const category = certificateConsentDefinitionSample.categories.find((item) =>
      item.terms.some((termItem) => termItem.id === termId),
    );
    return category?.terms.length ?? 0;
  }, [termId]);
  const isAgreed = termId ? getAgreedTermIds().has(termId) : false;

  if (!term) {
    return (
      <CloseButtonTemplate headerTitle="약관/동의서 상세" closePath="/consent-template">
        <div className="pt-10 text-center">약관을 찾을 수 없습니다.</div>
      </CloseButtonTemplate>
    );
  }

  return (
    <CloseButtonTemplate
      headerTitle="약관/동의서 상세"
      closePath="/consent-template"
      showBottomButton
      buttonText={categoryTermCount === 1 ? "동의하기" : isAgreed ? "확인" : "동의하기"}
      onButtonClick={() => {
        if (termId && !isAgreed) markTermAgreed(termId);
        navigate("/consent-template");
      }}
    >
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{term.title}</h2>
        {term.content.map((p, i) => (
          <p key={`${term.id}-${i}`} className="text-sm text-foreground/90 leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    </CloseButtonTemplate>
  );
}
