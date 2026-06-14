import { useEffect, useRef, useState } from "react";
import { AppButton } from "../../components/design-system/AppButton";
import honeyEventBannerImage from "./assets/ad-banners/ad-banner-honey-event.png";
import honeyEventBannerImageWebp from "./assets/ad-banners/ad-banner-honey-event.webp";
import portfolioEventBannerImage from "./assets/ad-banners/ad-banner-portfolio-event.png";
import portfolioEventBannerImageWebp from "./assets/ad-banners/ad-banner-portfolio-event.webp";
import kakaoEventBannerImage from "./assets/ad-banners/ad-banner-kakao-event.jpg";
import kakaoEventBannerImageWebp from "./assets/ad-banners/ad-banner-kakao-event.webp";

interface MainAdBannerProps {
  onClick?: () => void;
}

export function MainAdBanner({ onClick }: MainAdBannerProps) {
  const Container = onClick ? AppButton : "div";
  const [activeIndex, setActiveIndex] = useState(0);
  const [shouldRenderBanner, setShouldRenderBanner] = useState(false);
  const bannerSectionRef = useRef<HTMLDivElement>(null);

  const bannerImages = [
    {
      src: honeyEventBannerImage,
      srcWebp: honeyEventBannerImageWebp,
      alt: "WON Mobile honey money event banner",
    },
    {
      src: portfolioEventBannerImage,
      srcWebp: portfolioEventBannerImageWebp,
      alt: "WON Mobile portfolio event banner",
    },
    {
      src: kakaoEventBannerImage,
      srcWebp: kakaoEventBannerImageWebp,
      alt: "WON Mobile Kakao friend event banner",
    },
  ];

  useEffect(() => {
    const target = bannerSectionRef.current;

    if (!target) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setShouldRenderBanner(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldRenderBanner(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "160px 0px",
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldRenderBanner) {
      return;
    }

    const timerId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % bannerImages.length);
    }, 3500);

    return () => window.clearInterval(timerId);
  }, [bannerImages.length, shouldRenderBanner]);

  return (
    <div ref={bannerSectionRef} className="space-y-3">
      {shouldRenderBanner ? (
        <>
          <Container
            {...(onClick
              ? {
                  type: "button" as const,
                  variant: "unstyled" as const,
                  onClick,
                }
              : {})}
            className="block w-full overflow-hidden rounded-2xl text-left"
          >
            <div className="relative min-h-[120px] overflow-hidden rounded-2xl border border-[#E9D3CF] bg-[#F6E4E1] shadow-[0_10px_28px_rgba(0,60,166,0.10)]">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {bannerImages.map((bannerImage) => (
                  <picture
                    key={bannerImage.src}
                    className="block h-[120px] w-full shrink-0"
                  >
                    <source srcSet={bannerImage.srcWebp} type="image/webp" />
                    <img
                      src={bannerImage.src}
                      alt={bannerImage.alt}
                      className="h-[120px] w-full object-cover object-center"
                    />
                  </picture>
                ))}
              </div>
            </div>
          </Container>

          <div className="flex items-center justify-center gap-1.5">
            {bannerImages.map((bannerImage, index) => (
              <AppButton
                key={bannerImage.src}
                variant="unstyled"
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show advertisement ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  activeIndex === index ? "w-5 bg-primary" : "w-2 bg-primary/20"
                }`}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="min-h-[120px] overflow-hidden rounded-2xl border border-[#E9D3CF] bg-[#F6E4E1] shadow-[0_10px_28px_rgba(0,60,166,0.10)]">
            <div className="h-[120px] w-full animate-pulse bg-[linear-gradient(90deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.42)_50%,rgba(255,255,255,0.18)_100%)] bg-[length:200%_100%]" />
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <span className="h-2 w-5 rounded-full bg-primary/30" />
            <span className="h-2 w-2 rounded-full bg-primary/15" />
            <span className="h-2 w-2 rounded-full bg-primary/15" />
          </div>
        </>
      )}
    </div>
  );
}
