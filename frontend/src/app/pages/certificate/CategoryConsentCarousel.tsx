import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CloseButtonTemplate } from "../common/CloseButtonTemplate";
import { AppButton } from "../../components/design-system/AppButton";
import {
  findCategoryById,
  getCategoryCarouselIndex,
  markTermsAgreed,
  setCategoryCarouselIndex,
} from "../../data/terms";

export function CategoryConsentCarousel() {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const category = useMemo(
    () => (categoryId ? findCategoryById(categoryId) : null),
    [categoryId],
  );
  const [currentIndex, setCurrentIndex] = useState(() =>
    categoryId ? getCategoryCarouselIndex(categoryId) : 0,
  );
  const dragStartX = useRef<number | null>(null);

  if (!category) {
    return (
      <CloseButtonTemplate headerTitle="약관/동의서 상세" closePath="/certificate/step-1">
        <div className="space-y-3 text-center pt-10">
          <h2 className="text-xl font-semibold">약관 카테고리를 찾을 수 없어요.</h2>
          <p className="text-muted-foreground">다시 시도해 주세요.</p>
        </div>
      </CloseButtonTemplate>
    );
  }

  const currentTerm = category.items[currentIndex];
  const total = category.items.length;

  useEffect(() => {
    if (!categoryId) return;
    const saved = getCategoryCarouselIndex(categoryId);
    const bounded = Math.min(saved, Math.max(category.items.length - 1, 0));
    setCurrentIndex(bounded);
  }, [categoryId, category.items.length]);

  useEffect(() => {
    if (!categoryId) return;
    setCategoryCarouselIndex(categoryId, currentIndex);
  }, [categoryId, currentIndex]);

  const moveSlide = (delta: number) => {
    if (total <= 1) return;
    setCurrentIndex((prev) => {
      const next = prev + delta;
      if (next < 0) return 0;
      if (next >= total) return total - 1;
      return next;
    });
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

  const handleAgreeAll = () => {
    markTermsAgreed(category.items.map((item) => item.id));
    navigate("/certificate/step-1");
  };

  return (
    <CloseButtonTemplate
      headerTitle="약관/동의서 상세"
      closePath="/certificate/step-1"
      showBottomButton
      buttonText={total > 1 ? "모두 동의하기" : "동의하기"}
      onButtonClick={handleAgreeAll}
    >
      <div
        className="space-y-6 pb-4 select-none relative"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <section className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} / {total}
          </p>
          <h2 className="text-xl font-semibold">{currentTerm.title}</h2>
          <p className="text-muted-foreground leading-relaxed">{currentTerm.summary}</p>
        </section>

        <section className="space-y-3">
          {currentTerm.content.map((paragraph, index) => (
            <p key={`${currentTerm.id}-${index}`} className="text-sm leading-relaxed text-foreground/90">
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
