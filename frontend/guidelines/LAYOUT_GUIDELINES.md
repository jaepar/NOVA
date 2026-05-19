# Layout Guidelines

## 1) Frame Policy (Required)
- Base app frame: `390 x 844`
- Frame owner: `#root`
- If viewport is smaller than base, scale down with aspect ratio preserved.
- If viewport is larger than base, keep frame fixed at `390x844` (no upscale).
- Extra viewport area outside the frame must use a separate background color to clearly distinguish app vs non-app area.

## 2) Current Implementation Contract
- `src/main.tsx`
  - Computes `--app-scale` on load and resize.
  - Uses `scale = min(windowWidth/390, windowHeight/844, 1)`.
- `src/styles/theme.css`
  - `#root` uses fixed base size via CSS variables:
    - `--app-width: 390px`
    - `--app-height: 844px`
  - `#root` applies `transform: scale(var(--app-scale))`.
  - `body` centers the frame and provides viewport background color for side areas.

## 3) Layout Composition Rules
- Default page scaffold: `MobileLayout`
- Top area: `FixedHeader`
- Bottom fixed actions: `FloatingBottom` or `BottomNav`
- Header sizing and offset are centralized CSS variables:
  - `--app-header-top-padding: 20px`
  - `--app-header-height: 56px`
  - `--app-content-offset: 76px` (calculated)
- On first render, content must start at `--app-content-offset` to avoid overlap.
- Content start position must be identical across pages.
- On long pages, scrolling content passing behind fixed header is intended.
- Do not add per-page frame constraints such as `max-w-[390px] mx-auto`.
- Root frame sizing/scaling must remain centralized in `main.tsx` and `theme.css`.

## 4) Spacing Rules
- Horizontal page padding baseline: `px-5` (20px)
- Keep header/content/bottom spacing consistent with shared layout components.
- Avoid page-specific overrides that break global rhythm unless explicitly required.

## 5) Responsive Behavior Checklist
- [ ] At `390x844`: frame renders at 1:1 scale.
- [ ] Below base size: frame scales down proportionally without clipping.
- [ ] Above base size: frame stays at `390x844`.
- [ ] Non-app area uses distinct background color.
- [ ] Fixed header and bottom actions remain aligned to frame edges.

## 6) Update Policy
When frame behavior changes, update all of the following together:
- `frontend/AGENTS.md`
- `frontend/guidelines/DESIGN_SYSTEM.md`
- `frontend/guidelines/LAYOUT_GUIDELINES.md`
- `frontend/src/main.tsx`
- `frontend/src/styles/theme.css`
