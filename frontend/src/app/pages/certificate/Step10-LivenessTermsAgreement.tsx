import { useEffect, useMemo, useState } from "react";
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
      title: "[필수] 본인확인 서비스 이용 동의",
      required: true,
      terms: [
        {
          id: "face-collect",
          title: "안면인식 정보 수집·이용 동의서",
          summary: "안면인식 기반 본인확인을 위한 필수 동의입니다.",
        },
      ],
    },
  ],
} as const;

export function LivenessTermsAgreement() {
  const navigate = useNavigate();
  const location = useLocation();
  const savedOpenCategoryIds = useStep10TermsPageStore((state) => state.openCategoryIds);
  const checkedTermIdsState = useStep10TermsPageStore((state) => state.checkedTermIds);
  const setCheckedTermIds = useStep10TermsPageStore((state) => state.setCheckedTermIds);
  const setOpenCategoryIds = useStep10TermsPageStore((state) => state.setOpenCategoryIds);
  const setCategoryCursor = useStep10TermsPageStore((state) => state.setCategoryCursor);
  const reset = useStep10TermsPageStore((state) => state.reset);

  const [openCategoryIds, setOpenCategoryIdsState] = useState<string[]>(() => {
    if (savedOpenCategoryIds.length > 0) return savedOpenCategoryIds;
    return livenessConsentDefinition.categories.filter((category) => category.required).map((category) => category.id);
  });

  const checkedTermIds = useMemo(() => new Set(checkedTermIdsState), [checkedTermIdsState]);
  const requiredTermIds = useMemo(
    () =>
      livenessConsentDefinition.categories
        .filter((category) => category.required)
        .flatMap((category) => category.terms.map((term) => term.id)),
    [],
  );
  const isAllRequiredChecked = requiredTermIds.every((id) => checkedTermIds.has(id));

  useEffect(() => {
    const shouldPreserve = Boolean((location.state as { preserveStep10State?: boolean } | null)?.preserveStep10State);
    if (shouldPreserve) return;

    reset();
    setOpenCategoryIdsState(livenessConsentDefinition.categories.filter((category) => category.required).map((category) => category.id));
  }, [location.state, reset]);

  useEffect(() => {
    setOpenCategoryIds(openCategoryIds);
  }, [openCategoryIds, setOpenCategoryIds]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategoryIdsState((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    );
  };

  const handleCategoryCheckClick = (categoryId: string) => {
    const category = livenessConsentDefinition.categories.find((item) => item.id === categoryId);
    if (!category) return;

    const categoryTermIds = category.terms.map((term) => term.id);
    const isCategoryAllChecked = categoryTermIds.every((id) => checkedTermIds.has(id));

    if (isCategoryAllChecked) {
      const next = new Set(checkedTermIds);
      categoryTermIds.forEach((id) => next.delete(id));
      setCheckedTermIds(Array.from(next));
      return;
    }

    setCategoryCursor(categoryId, 0);
    navigate(`/certificate/step-10/categories/${categoryId}/consent`, { state: { preserveStep10State: true } });
  };

  const handleTermCheckClick = (termId: string) => {
    if (checkedTermIds.has(termId)) {
      const next = new Set(checkedTermIds);
      next.delete(termId);
      setCheckedTermIds(Array.from(next));
      return;
    }
    navigate(`/certificate/step-10/terms/${termId}`, { state: { preserveStep10State: true } });
  };

  return (
    <MobileLayout
      title="비대면 실명확인"
      bottomContent={
        <Btn_1Col disabled={!isAllRequiredChecked} onClick={() => navigate("/certificate/step-11")}>
          동의하고 촬영하기
        </Btn_1Col>
      }
    >
      <div className="space-y-4 pb-2">
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold leading-tight">
            서비스 가입을 위해
            <br />
            약관에 동의해 주세요
          </h2>
        </section>

        <section className="space-y-3">
          {livenessConsentDefinition.categories.map((category) => {
            const isOpen = openCategoryIds.includes(category.id);
            const isCategoryAllChecked = category.terms.every((term) => checkedTermIds.has(term.id));

            return (
              <div key={category.id} className="rounded-2xl bg-secondary p-4">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-3 text-left flex-1 min-w-0">
                    <AppButton variant="unstyled" onClick={() => handleCategoryCheckClick(category.id)} className="p-1">
                      <CheckCircle2
                        className={`w-5 h-5 ${isCategoryAllChecked ? "text-blue-600 fill-blue-100" : "text-muted-foreground"}`}
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
                  <div className="mt-3 border-t border-border pt-2">
                    {category.terms.map((term) => (
                      <div key={term.id} className="w-full flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 text-left">
                          <AppButton variant="unstyled" onClick={() => handleTermCheckClick(term.id)} className="p-1">
                            <CheckCircle2
                              className={`w-4 h-4 ${checkedTermIds.has(term.id) ? "text-blue-600 fill-blue-100" : "text-muted-foreground"}`}
                            />
                          </AppButton>
                          <AppButton
                            variant="unstyled"
                            onClick={() => navigate(`/certificate/step-10/terms/${term.id}`, { state: { preserveStep10State: true } })}
                            className="text-sm text-left"
                          >
                            {term.title}
                          </AppButton>
                        </div>
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
