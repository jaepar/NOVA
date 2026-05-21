import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CloseButtonTemplate } from "../common/CloseButtonTemplate";
import { AppButton } from "../../components/design-system/AppButton";
import { certificateConsentDefinitionSample } from "../../domains/certificate-consent/definition.sample";
import { findCategory } from "../../domains/certificate-consent/spec";
import { getCategoryCursor, markTermsAgreed, setCategoryCursor } from "../../domains/certificate-consent/storage";

export function AllTermsAgreements() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const dragStartX = useRef<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const category = useMemo(
    () => (categoryId ? findCategory(certificateConsentDefinitionSample, categoryId) : null),
    [categoryId],
  );

  useEffect(() => {
    if (!category || !categoryId) return;
    const saved = getCategoryCursor(categoryId);
    const bounded = Math.min(Math.max(0, saved), Math.max(category.terms.length - 1, 0));
    setCurrentIndex(bounded);
  }, [category, categoryId]);

  useEffect(() => {
    if (!categoryId) return;
    setCategoryCursor(categoryId, currentIndex);
  }, [categoryId, currentIndex]);

  if (!category) {
    return (
      <CloseButtonTemplate
        headerTitle="약관/동의서 상세"
        onClose={() => navigate("/certificate/step-01", { state: { preserveConsentState: true } })}
      >
        <div className="space-y-3 text-center pt-10">
          <h2 className="text-xl font-semibold">약관 카테고리를 찾을 수 없어요.</h2>
          <p className="text-muted-foreground">다시 시도해 주세요.</p>
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
      onClose={() => navigate("/certificate/step-01", { state: { preserveConsentState: true } })}
      showBottomButton
      buttonText={total > 1 ? "모두 동의하기" : "동의하기"}
      onButtonClick={() => {
        markTermsAgreed(category.terms.map((term) => term.id));
        navigate("/certificate/step-01", { state: { preserveConsentState: true } });
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
