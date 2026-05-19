# Frontend AGENTS Guide (NOVA)

This file defines the operating rules for all work under `frontend/`.

Reference docs:
- `guidelines/DESIGN_SYSTEM.md`
- `guidelines/LAYOUT_GUIDELINES.md`

## 1) Goal
- Keep a consistent mobile-app-like UI on web.
- Apply one shared layout standard to all pages.
- Prefer design tokens and shared components over one-off styles.

## 2) Priority
1. `frontend/AGENTS.md`
2. `frontend/guidelines/DESIGN_SYSTEM.md`
3. `frontend/guidelines/LAYOUT_GUIDELINES.md`
4. Existing page implementation details

If rules conflict, follow this file first.

## 3) Frame Standard (Required)
- App frame base size: `390 x 844`.
- The root app frame is controlled by `#root`.
- On smaller viewports, keep aspect ratio and scale down.
- On larger viewports, do not scale above `390x844`.
- Keep non-app side area visually separated from the app frame.

## 4) Layout Rules (Required)
- New pages should use `MobileLayout` by default.
- Use `FixedHeader` for top navigation.
- Use `FloatingBottom` or `BottomNav` for bottom fixed actions.
- Initial render content must start below fixed header without overlap.
- All pages must use the same content start offset under header.
- During scroll, content moving behind the fixed header is expected behavior.
- Do not add page-level duplicate width constraints like `max-w-[390px] mx-auto`.
- Width/height/centering/scaling must be managed at root frame level.

## 5) Component Rules
- For primary actions, prefer `Btn_1Col` and `Btn_2Col`.
- For input blocks, prefer shared components like `CommonInputGroup`.
- Prefer design-system tokens over ad-hoc inline styles.

## 6) Verification Checklist
- [ ] `390x844` frame behavior is preserved
- [ ] Scale-down behavior works on smaller screens
- [ ] Header/content/bottom fixed areas do not overlap
- [ ] Shared layout components are used consistently
- [ ] No duplicate per-page frame constraints were added

## 7) File Ownership Guide
- Root frame and scaling: `src/main.tsx`, `src/styles/theme.css`
- Shared layout: `src/app/components/layout/*`
- Page implementation: `src/app/pages/*`
- Design system: `src/app/components/design-system/*`

## 8) Doc Sync Policy
When frame or layout standards change, update all three together:
- `frontend/AGENTS.md`
- `frontend/guidelines/DESIGN_SYSTEM.md`
- `frontend/guidelines/LAYOUT_GUIDELINES.md`
