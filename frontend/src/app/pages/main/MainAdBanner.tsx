import { useEffect, useState } from "react";
import { AppButton } from "../../components/design-system/AppButton";
import honeyEventBannerImage from "./assets/ad-banners/ad-banner-honey-event.webp";
import portfolioEventBannerImage from "./assets/ad-banners/ad-banner-portfolio-event.webp";
import kakaoEventBannerImage from "./assets/ad-banners/ad-banner-kakao-event.webp";

interface MainAdBannerProps {
  onClick?: () => void;
}

export function MainAdBanner({ onClick }: MainAdBannerProps) {
  const Container = onClick ? AppButton : "div";
  const [activeIndex, setActiveIndex] = useState(0);

  const bannerImages = [
    {
      src: honeyEventBannerImage,
      alt: "WON Mobile honey money event banner",
    },
    {
      src: portfolioEventBannerImage,
      alt: "WON Mobile portfolio event banner",
    },
    {
      src: kakaoEventBannerImage,
      alt: "WON Mobile Kakao friend event banner",
    },
  ];

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % bannerImages.length);
    }, 3500);

    return () => window.clearInterval(timerId);
  }, [bannerImages.length]);

  return (
    <div className="space-y-3">
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
        <div className="relative aspect-[464/152] overflow-hidden rounded-2xl border border-[#E9D3CF] bg-[#F6E4E1] shadow-[0_10px_28px_rgba(0,60,166,0.10)]">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {bannerImages.map((bannerImage, index) => (
              <img
                key={bannerImage.src}
                src={bannerImage.src}
                alt={bannerImage.alt}
                fetchPriority={index === 0 ? "high" : "auto"}
                className="block h-full w-full shrink-0 object-cover object-center"
              />
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
    </div>
  );
}
