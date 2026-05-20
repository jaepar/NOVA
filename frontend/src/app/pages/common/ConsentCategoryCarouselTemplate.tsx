import { useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CloseButtonTemplate } from "../common/CloseButtonTemplate";
import { AppButton } from "../../components/design-system/AppButton";
import { certificateConsentDefinitionSample } from "../../domains/certificate-consent/definition.sample";
import { findCategory } from "../../domains/certificate-consent/spec";
import { markTermsAgreed } from "../../domains/certificate-consent/storage";
import { useConsentCarouselTemplateStore } from "../../stores/pageStores";

export function ConsentCategoryCarouselTemplate() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const currentIndex = useConsentCarouselTemplateStore((state) => state.currentIndex);
  const setCurrentIndex = useConsentCarouselTemplateStore((state) => state.setCurrentIndex);
  const dragStartX = useRef<number | null>(null);

  const category = useMemo(
    () => (categoryId ? findCategory(certificateConsentDefinitionSample, categoryId) : null),
    [categoryId],
  );

  if (!category) {
    return (
      <CloseButtonTemplate headerTitle="약관/동의서 상세" closePath="/consent-template">
        <div className="pt-10 text-center">카테고리를 찾을 수 없습니다.</div>
      </CloseButtonTemplate>
    );
  }

  const total = category.terms.length;
  const current = category.terms[currentIndex];

  const move = (delta: number) => {
    if (total <= 1) return;
    setCurrentIndex((prev) => Math.min(total - 1, Math.max(0, prev + delta)));
  };

  const onDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = event.clientX;
  };
  const onUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const diff = event.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(diff) < 40) return;
    if (diff < 0) move(1);
    if (diff > 0) move(-1);
  };

  return (
    <CloseButtonTemplate
      headerTitle="약관/동의서 상세"
      closePath="/consent-template"
      showBottomButton
      buttonText={total > 1 ? "모두 동의하기" : "동의하기"}
      onButtonClick={() => {
        markTermsAgreed(category.terms.map((term) => term.id));
        navigate("/consent-template");
      }}
    >
      <div className="space-y-4 select-none" onPointerDown={onDown} onPointerUp={onUp}>
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} / {total}
        </p>
        <h2 className="text-xl font-semibold">{current.title}</h2>
        {current.content.map((p, i) => (
          <p key={`${current.id}-${i}`} className="text-sm text-foreground/90 leading-relaxed">
            {p}
          </p>
        ))}

        {total > 1 && (
          <>
            <AppButton
              variant="unstyled"
              onClick={() => move(-1)}
              disabled={currentIndex === 0}
              className="fixed left-3 top-1/2 -translate-y-1/2 z-50 w-9 h-9 rounded-full bg-background/95 border border-border shadow-sm flex items-center justify-center disabled:opacity-40"
            >
              <ChevronLeft className="w-5 h-5" />
            </AppButton>
            <AppButton
              variant="unstyled"
              onClick={() => move(1)}
              disabled={currentIndex === total - 1}
              className="fixed right-3 top-1/2 -translate-y-1/2 z-50 w-9 h-9 rounded-full bg-background/95 border border-border shadow-sm flex items-center justify-center disabled:opacity-40"
            >
              <ChevronRight className="w-5 h-5" />
            </AppButton>
          </>
        )}
      </div>
    </CloseButtonTemplate>
  );
}
