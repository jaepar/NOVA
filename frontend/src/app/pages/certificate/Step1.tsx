import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";
import { AppButton } from "../../components/design-system/AppButton";
import {
  getAgreedTermIds,
  getOpenCategoryIds,
  setAgreedTermIds,
  setOpenCategoryIds,
  termCategories,
} from "../../data/terms";

export function Step1() {
  const navigate = useNavigate();
  const [openCategoryIds, setOpenCategoryIdsState] = useState<string[]>(() => {
    const saved = getOpenCategoryIds();
    if (saved.length > 0) return saved;
    return termCategories.filter((category) => category.required).map((category) => category.id);
  });
  const [checkedTermIds, setCheckedTermIds] = useState<Set<string>>(() => getAgreedTermIds());

  const requiredTermIds = useMemo(
    () =>
      termCategories
        .flatMap((category) => category.items)
        .filter((item) => item.required)
        .map((item) => item.id),
    [],
  );

  const isAllRequiredChecked = requiredTermIds.every((id) => checkedTermIds.has(id));

  useEffect(() => {
    setOpenCategoryIds(openCategoryIds);
  }, [openCategoryIds]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategoryIdsState((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleCategoryCheckClick = (categoryId: string) => {
    const category = termCategories.find((item) => item.id === categoryId);
    if (!category) return;

    const categoryTermIds = category.items.map((item) => item.id);
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

    navigate(`/certificate/step-1/categories/${categoryId}/consent`);
  };

  const handleTermCheckClick = (termId: string) => {
    const isChecked = checkedTermIds.has(termId);

    if (isChecked) {
      setCheckedTermIds((prev) => {
        const next = new Set(prev);
        next.delete(termId);
        setAgreedTermIds(next);
        return next;
      });
      return;
    }

    navigate(`/certificate/step-1/terms/${termId}`);
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
            서비스 가입을 위해
            <br />
            약관에 동의해 주세요
          </h2>
        </section>

        <section className="space-y-3">
          {termCategories.map((category) => {
            const isOpen = openCategoryIds.includes(category.id);

            return (
              <div key={category.id} className="rounded-2xl bg-secondary p-4">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-3 text-left flex-1 min-w-0">
                    <AppButton
                      variant="unstyled"
                      onClick={() => handleCategoryCheckClick(category.id)}
                      className="p-1"
                      aria-label={`${category.title} 전체 동의`}
                    >
                      <CheckCircle2
                        className={`w-5 h-5 ${
                          category.items.every((item) => checkedTermIds.has(item.id))
                            ? "text-blue-600 fill-blue-100"
                            : "text-muted-foreground"
                        }`}
                      />
                    </AppButton>
                    <AppButton
                      variant="unstyled"
                      onClick={() => toggleCategory(category.id)}
                      className="flex-1 min-w-0 text-left py-1"
                      aria-label={`${category.title} 아코디언 ${isOpen ? "닫기" : "열기"}`}
                    >
                      <span className="font-medium">{category.title}</span>
                    </AppButton>
                  </div>
                  <AppButton
                    variant="unstyled"
                    onClick={() => toggleCategory(category.id)}
                    className="p-1"
                    aria-label={`${category.title} 아코디언 ${isOpen ? "닫기" : "열기"}`}
                  >
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </AppButton>
                </div>

                {isOpen && (
                  <div className="mt-3 border-t border-border pt-2">
                    {category.items.map((item) => (
                      <div key={item.id} className="w-full flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 text-left">
                          <AppButton
                            variant="unstyled"
                            onClick={() => handleTermCheckClick(item.id)}
                            className="p-1"
                            aria-label={`${item.title} 동의 상태 변경`}
                          >
                            <CheckCircle2
                              className={`w-4 h-4 ${
                                checkedTermIds.has(item.id)
                                  ? "text-blue-600 fill-blue-100"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </AppButton>
                          <AppButton
                            variant="unstyled"
                            onClick={() => navigate(`/certificate/step-1/terms/${item.id}`)}
                            className="text-sm text-left"
                            aria-label={`${item.title} 상세보기`}
                          >
                            {item.title}
                          </AppButton>
                        </div>
                        <AppButton
                          variant="unstyled"
                          onClick={() => navigate(`/certificate/step-1/terms/${item.id}`)}
                          className="p-1"
                          aria-label={`${item.title} 상세보기`}
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
