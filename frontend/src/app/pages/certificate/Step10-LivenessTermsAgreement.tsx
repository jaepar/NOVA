import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { AppButton } from "../../components/design-system/AppButton";
import { useStep10TermsPageStore } from "../../stores/pageStores";

const livenessConsentDefinition = {
  categories: [
    {
      id: "required-service",
      title: "[필수] 서비스 가입 동의",
      required: true,
      terms: [
        {
          id: "face-collect",
          title: "개인(신용)정보 수집·이용 동의서",
          summary: "안면인식 본인확인을 위한 필수 동의입니다.",
        },
      ],
    },
  ],
} as const;

export function LivenessTermsAgreement() {
  const navigate = useNavigate();
  const location = useLocation();
  const checkedTermIds = useStep10TermsPageStore((state) => state.checkedTermIds);
  const openCategoryIds = useStep10TermsPageStore((state) => state.openCategoryIds);
  const setCheckedTermIds = useStep10TermsPageStore((state) => state.setCheckedTermIds);
  const setOpenCategoryIds = useStep10TermsPageStore((state) => state.setOpenCategoryIds);
  const reset = useStep10TermsPageStore((state) => state.reset);

  useEffect(() => {
    const shouldPreserve = Boolean((location.state as { preserveStep10State?: boolean } | null)?.preserveStep10State);
    if (!shouldPreserve) reset();
  }, [location.state, reset]);

  const checkedSet = useMemo(() => new Set(checkedTermIds), [checkedTermIds]);
  const requiredTermIds = useMemo(
    () =>
      livenessConsentDefinition.categories
        .flatMap((category) => category.terms)
        .filter((term) => livenessConsentDefinition.categories.find((c) => c.terms.some((t) => t.id === term.id))?.required)
        .map((term) => term.id),
    [],
  );
  const isRequiredComplete = requiredTermIds.every((id) => checkedSet.has(id));

  const toggleCategory = (categoryId: string) => {
    setOpenCategoryIds(
      openCategoryIds.includes(categoryId)
        ? openCategoryIds.filter((id) => id !== categoryId)
        : [...openCategoryIds, categoryId],
    );
  };

  const toggleTerm = (termId: string) => {
    const next = new Set(checkedSet);
    if (next.has(termId)) next.delete(termId);
    else next.add(termId);
    setCheckedTermIds(Array.from(next));
  };

  const toggleCategoryTerms = (categoryId: string) => {
    const category = livenessConsentDefinition.categories.find((item) => item.id === categoryId);
    if (!category) return;
    const termIds = category.terms.map((term) => term.id);
    const isAllChecked = termIds.every((id) => checkedSet.has(id));
    const next = new Set(checkedSet);
    if (isAllChecked) {
      termIds.forEach((id) => next.delete(id));
    } else {
      termIds.forEach((id) => next.add(id));
    }
    setCheckedTermIds(Array.from(next));
  };

  return (
    <MobileLayout
      title="비대면 실명확인"
      bottomContent={
        <Btn_1Col disabled={!isRequiredComplete} onClick={() => navigate("/certificate/step-11")}>
          전체 동의하기
        </Btn_1Col>
      }
    >
      <div className="space-y-4 pb-2">
        <section className="space-y-1">
          <h2 className="text-2xl font-semibold leading-tight">
            서비스 가입을 위해
            <br />
            약관에 동의해 주세요
          </h2>
          <p className="text-muted-foreground">약관 동의 페이지</p>
        </section>

        <section className="space-y-3">
          {livenessConsentDefinition.categories.map((category) => {
            const isOpen = openCategoryIds.includes(category.id);
            const isCategoryChecked = category.terms.every((term) => checkedSet.has(term.id));

            return (
              <div key={category.id} className="rounded-2xl bg-secondary p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <AppButton variant="unstyled" onClick={() => toggleCategoryTerms(category.id)} className="p-1">
                      <CheckCircle2
                        className={`w-5 h-5 ${isCategoryChecked ? "text-primary fill-blue-100" : "text-muted-foreground"}`}
                      />
                    </AppButton>
                    <AppButton
                      variant="unstyled"
                      onClick={() => toggleCategory(category.id)}
                      className="flex-1 min-w-0 text-left py-1"
                    >
                      <span className="font-medium">{category.title}</span>
                    </AppButton>
                  </div>
                  <AppButton variant="unstyled" onClick={() => toggleCategory(category.id)} className="p-1">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </AppButton>
                </div>

                {isOpen && (
                  <div className="mt-3 border-t border-border pt-2 space-y-1">
                    {category.terms.map((term) => (
                      <div key={term.id} className="flex items-center gap-2 py-2">
                        <AppButton variant="unstyled" onClick={() => toggleTerm(term.id)} className="p-1">
                          <CheckCircle2
                            className={`w-4 h-4 ${checkedSet.has(term.id) ? "text-primary fill-blue-100" : "text-muted-foreground"}`}
                          />
                        </AppButton>
                        <AppButton
                          variant="unstyled"
                          onClick={() => navigate(`/certificate/step-10/terms/${term.id}`, { state: { preserveStep10State: true } })}
                          className="min-w-0 flex-1 text-left"
                        >
                          <p className="text-sm">{term.title}</p>
                          <p className="text-xs text-muted-foreground">{term.summary}</p>
                        </AppButton>
                        <AppButton
                          variant="unstyled"
                          onClick={() => navigate(`/certificate/step-10/terms/${term.id}`, { state: { preserveStep10State: true } })}
                          className="p-1"
                        >
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </AppButton>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </MobileLayout>
  );
}
