import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CloseButtonTemplate } from "../../pages/common/CloseButtonTemplate";
import { ConsentDefinition, findTerm } from "../../domains/certificate-consent/spec";
import { getAgreedTermIds, markTermAgreed } from "../../domains/certificate-consent/storage";

interface ConsentTermDetailViewProps {
  definition: ConsentDefinition;
  termId?: string;
  basePath?: string;
  preserveStateKey?: string;
  showSelectionControls?: boolean;
}

export function ConsentTermDetailView({
  definition,
  termId,
  basePath = "/consent-template",
  preserveStateKey = "preserveConsentState",
  showSelectionControls = true,
}: ConsentTermDetailViewProps) {
  const navigate = useNavigate();
  const term = useMemo(() => (termId ? findTerm(definition, termId) : null), [definition, termId]);
  const isAgreed = termId ? getAgreedTermIds().has(termId) : false;

  if (!term) {
    return (
      <CloseButtonTemplate
        headerTitle="약관/동의서 상세"
        onClose={() => navigate(basePath, { state: { [preserveStateKey]: true } })}
      >
        <div className="pt-10 text-center">약관을 찾을 수 없습니다.</div>
      </CloseButtonTemplate>
    );
  }

  return (
    <CloseButtonTemplate
      headerTitle="약관/동의서 상세"
      onClose={() => navigate(basePath, { state: { [preserveStateKey]: true } })}
      showBottomButton={showSelectionControls}
      buttonText="동의하기"
      onButtonClick={() => {
        if (termId && !isAgreed) markTermAgreed(termId);
        navigate(basePath, { state: { [preserveStateKey]: true } });
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
