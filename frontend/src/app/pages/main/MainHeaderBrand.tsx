import headerBrandWordmark from "./assets/header-brand-wordmark.webp";

export function MainHeaderBrand() {
  return (
    <div className="flex w-max shrink-0 items-center gap-3">
      <img
        src={headerBrandWordmark}
        alt="NOVA"
        className="h-[22px] w-auto shrink-0 object-contain"
      />
    </div>
  );
}
