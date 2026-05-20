import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { AppButton } from "../../components/design-system/AppButton";
import { certificateConsentDefinitionSample } from "../../domains/certificate-consent/definition.sample";
import { getRequiredTermIds } from "../../domains/certificate-consent/spec";
import {
  getAgreedTermIds,
  getOpenCategoryIds,
  resetConsentStorage,
  setAgreedTermIds,
  setCategoryCursor,
  setOpenCategoryIds,
} from "../../domains/certificate-consent/storage";

export function Step1() {
  const navigate = useNavigate();
  const location = useLocation();
  const definition = certificateConsentDefinitionSample;
  const [openCategoryIds, setOpenCategoryIdsState] = useState<string[]>(() => {
    const saved = getOpenCategoryIds();
    if (saved.length > 0) return saved;
    return definition.categories.filter((category) => category.required).map((category) => category.id);
  });
  const [checkedTermIds, setCheckedTermIds] = useState<Set<string>>(() => getAgreedTermIds());

  const requiredTermIds = useMemo(() => getRequiredTermIds(definition), [definition]);
  const isAllRequiredChecked = requiredTermIds.every((id) => checkedTermIds.has(id));

  useEffect(() => {
    const shouldPreserve = Boolean((location.state as { preserveConsentState?: boolean } | null)?.preserveConsentState);
    if (shouldPreserve) return;

    resetConsentStorage();
    const initialOpenCategoryIds = definition.categories
      .filter((category) => category.required)
      .map((category) => category.id);
    setOpenCategoryIdsState(initialOpenCategoryIds);
    setCheckedTermIds(new Set());
  }, [definition.categories, location.state]);

  useEffect(() => {
    setOpenCategoryIds(openCategoryIds);
  }, [openCategoryIds]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategoryIdsState((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    );
  };

  const handleCategoryCheckClick = (categoryId: string) => {
    const category = definition.categories.find((item) => item.id === categoryId);
    if (!category) return;
    const categoryTermIds = category.terms.map((term) => term.id);
    const isCategoryAllChecked = categoryTermIds.every((id) => checkedTermIds.has(id));

    if (isCategoryAllChecked) {
      setCheckedTermIds((prev) => {
        const next = new Set(prev);
        categoryTermIds.forEach((id) => next.delete(id));
        setAgreedTermIds(next);
        return next;
      });
      return;
    }

    setCategoryCursor(categoryId, 0);
    navigate(`/certificate/step-1/categories/${categoryId}/consent`, { state: { preserveConsentState: true } });
  };

  const handleTermCheckClick = (termId: string) => {
    if (checkedTermIds.has(termId)) {
      setCheckedTermIds((prev) => {
        const next = new Set(prev);
        next.delete(termId);
        setAgreedTermIds(next);
        return next;
      });
      return;
    }
    navigate(`/certificate/step-1/terms/${termId}`, { state: { preserveConsentState: true } });
  };

  return (
    <MobileLayout
      title="시작하기"
      bottomContent={
        <Btn_1Col onClick={() => navigate("/certificate/step-2")} disabled={!isAllRequiredChecked}>
          동의하고 계속하기
        </Btn_1Col>
      }
    >
      <div className="space-y-4 pb-2">
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold leading-tight">
            인증서 발급을 위해
            <br />
            약관에 동의해 주세요
          </h2>
        </section>

        <section className="space-y-3">
          {definition.categories.map((category) => {
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
                            onClick={() => navigate(`/certificate/step-1/terms/${term.id}`, { state: { preserveConsentState: true } })}
                            className="text-sm text-left"
                          >
                            {term.title}
                          </AppButton>
                        </div>
                        <AppButton
                          variant="unstyled"
                          onClick={() => navigate(`/certificate/step-1/terms/${term.id}`, { state: { preserveConsentState: true } })}
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
