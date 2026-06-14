import headerBrandWordmark from "./assets/header-brand-wordmark.png";
import headerBrandWordmarkWebp from "./assets/header-brand-wordmark.webp";

export function MainHeaderBrand() {
  return (
    <div className="flex w-max shrink-0 items-center gap-3">
      <picture>
        <source srcSet={headerBrandWordmarkWebp} type="image/webp" />
        <img
          src={headerBrandWordmark}
          alt="NOVA"
          className="h-[22px] w-auto shrink-0 object-contain"
        />
      </picture>
    </div>
  );
}
