import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CloseButtonTemplate } from "../common/CloseButtonTemplate";
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
          content: [
            "본 동의서는 안면인식 기반 본인확인을 위해 필요한 최소한의 정보를 수집·이용하기 위한 내용입니다.",
            "수집 항목은 얼굴 이미지 및 생체인식 결과이며, 본인확인 목적 범위 내에서만 사용됩니다.",
            "보유기간은 본인확인 완료 후 지체 없이 파기하며, 법령에 따른 보관 의무가 있는 경우 해당 기간 동안 보관될 수 있습니다.",
          ],
        },
      ],
    },
  ],
} as const;

export function Step10AllTermsAgreements() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const dragStartX = useRef<number | null>(null);
  const checkedTermIds = useStep10TermsPageStore((state) => state.checkedTermIds);
  const setCheckedTermIds = useStep10TermsPageStore((state) => state.setCheckedTermIds);
  const categoryCursor = useStep10TermsPageStore((state) => state.categoryCursor);
  const setCategoryCursor = useStep10TermsPageStore((state) => state.setCategoryCursor);
  const [currentIndex, setCurrentIndex] = useState(0);

  const category = useMemo(
    () => livenessConsentDefinition.categories.find((item) => item.id === categoryId) ?? null,
    [categoryId],
  );

  useEffect(() => {
    if (!category || !categoryId) return;
    const saved = categoryCursor[categoryId] ?? 0;
    const bounded = Math.min(Math.max(0, saved), Math.max(category.terms.length - 1, 0));
    setCurrentIndex(bounded);
  }, [category, categoryCursor, categoryId]);

  useEffect(() => {
    if (!categoryId) return;
    setCategoryCursor(categoryId, currentIndex);
  }, [categoryId, currentIndex, setCategoryCursor]);

  if (!category) {
    return (
      <CloseButtonTemplate
        headerTitle="약관/동의서 상세"
        onClose={() => navigate("/certificate/step-10", { state: { preserveStep10State: true } })}
      >
        <div className="space-y-3 text-center pt-10">
          <h2 className="text-xl font-semibold">약관 카테고리를 찾을 수 없어요</h2>
          <p className="text-muted-foreground">다시 시도해 주세요</p>
        </div>
      </CloseButtonTemplate>
    );
  }

  const total = category.terms.length;
  const current = category.terms[currentIndex];

  const moveSlide = (delta: number) => {
    if (total <= 1) return;
    setCurrentIndex((prev) => Math.min(total - 1, Math.max(0, prev + delta)));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = event.clientX;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const diff = event.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(diff) < 40) return;
    if (diff < 0) moveSlide(1);
    if (diff > 0) moveSlide(-1);
  };

  return (
    <CloseButtonTemplate
      headerTitle="약관/동의서 상세"
      onClose={() => navigate("/certificate/step-10", { state: { preserveStep10State: true } })}
      showBottomButton
      buttonText={total > 1 ? "모두 동의하기" : "동의하기"}
      onButtonClick={() => {
        const next = new Set(checkedTermIds);
        category.terms.forEach((term) => next.add(term.id));
        setCheckedTermIds(Array.from(next));
        navigate("/certificate/step-10", { state: { preserveStep10State: true } });
      }}
    >
      <div className="space-y-6 pb-4 select-none relative" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
        <section className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} / {total}
          </p>
          <h2 className="text-xl font-semibold">{current.title}</h2>
          <p className="text-muted-foreground leading-relaxed">{current.summary}</p>
        </section>

        <section className="space-y-3">
          {current.content.map((paragraph, index) => (
            <p key={`${current.id}-${index}`} className="text-sm leading-relaxed text-foreground/90">
              {paragraph}
            </p>
          ))}
        </section>

        {total > 1 && (
          <>
            <AppButton
              variant="unstyled"
              onClick={() => moveSlide(-1)}
              disabled={currentIndex === 0}
              className="fixed left-3 top-1/2 -translate-y-1/2 z-50 w-9 h-9 rounded-full bg-background/95 border border-border shadow-sm flex items-center justify-center disabled:opacity-40"
              aria-label="이전 약관"
            >
              <ChevronLeft className="w-5 h-5" />
            </AppButton>
            <AppButton
              variant="unstyled"
              onClick={() => moveSlide(1)}
              disabled={currentIndex === total - 1}
              className="fixed right-3 top-1/2 -translate-y-1/2 z-50 w-9 h-9 rounded-full bg-background/95 border border-border shadow-sm flex items-center justify-center disabled:opacity-40"
              aria-label="다음 약관"
            >
              <ChevronRight className="w-5 h-5" />
            </AppButton>
          </>
        )}
      </div>
    </CloseButtonTemplate>
  );
}
