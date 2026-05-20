import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CloseButtonTemplate } from "../common/CloseButtonTemplate";
import { findTermById, getAgreedTermIds, markTermAgreed } from "../../data/terms";

export function Step1TermDetail() {
  const navigate = useNavigate();
  const { termId } = useParams();

  const term = useMemo(() => (termId ? findTermById(termId) : null), [termId]);
  const isAgreed = useMemo(() => {
    if (!termId) return false;
    return getAgreedTermIds().has(termId);
  }, [termId]);

  if (!term) {
    return (
      <CloseButtonTemplate headerTitle="약관/동의서 상세" closePath="/certificate/step-1">
        <div className="space-y-3 text-center pt-10">
          <h2 className="text-xl font-semibold">약관을 찾을 수 없어요.</h2>
          <p className="text-muted-foreground">다시 선택해 주세요.</p>
        </div>
      </CloseButtonTemplate>
    );
  }

  return (
    <CloseButtonTemplate
      headerTitle="약관/동의서 상세"
      closePath="/certificate/step-1"
      showBottomButton
      buttonText={isAgreed ? "확인" : "동의하기"}
      onButtonClick={() => {
        if (!termId) {
          navigate("/certificate/step-1");
          return;
        }
        if (!isAgreed) {
          markTermAgreed(termId);
        }
        navigate("/certificate/step-1");
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
