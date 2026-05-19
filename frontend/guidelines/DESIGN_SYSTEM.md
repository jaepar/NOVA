# Design System Guidelines

## 1) Scope
This guide defines shared UI rules for NOVA frontend pages and components.

Primary references:
- `frontend/AGENTS.md`
- `frontend/guidelines/LAYOUT_GUIDELINES.md`

## 2) Core Tokens
- Base frame: `390 x 844`
- Horizontal page padding baseline: `px-5` (20px)
- Primary color: `#6366F1`
- Text color: `#1F2937`
- Secondary text: `#6B7280`
- Border: `#E5E7EB`
- Background: `#FFFFFF`

## 3) Typography
- Primary font: `Inter`
- Secondary font: `Urbanist`
- Scale (theme variables):
  - `--text-2xl`: 24px
  - `--text-xl`: 20px
  - `--text-lg`: 18px
  - `--text-base`: 16px
  - `--text-sm`: 14px
  - `--text-xs`: 12px

## 4) Button System (Required)
- All interactive buttons must use shared design-system button components.
- Use:
  - `AppButton` for generic button interaction wrapper
  - `Btn_1Col` for full-width primary/secondary/outline CTA
  - `Btn_2Col` for dual CTA layouts
- Page-level direct `<button>` usage is not allowed.
- Text, state, and action differences should be controlled via props.

## 5) Input System
- Prefer shared inputs such as `CommonInputGroup`.
- Avoid ad-hoc input styling when a design-system component exists.

## 6) Layout Components
- `FixedHeader`: top fixed header
- `MobileLayout`: default page scaffold
- `FloatingBottom`: fixed bottom CTA container
- `BottomNav`: fixed bottom navigation
- `BottomSheet`: shared bottom sheet interaction

## 7) Interaction Principles
- Keep hover/active behavior consistent with existing component variants.
- Do not introduce one-off visual behavior that conflicts with shared components.
- Maintain consistent spacing rhythm across pages.

## 8) Compliance Checklist
- [ ] Uses shared layout scaffold/components
- [ ] Uses shared button components only
- [ ] Uses shared input components where applicable
- [ ] Keeps frame and spacing standards intact
- [ ] No page-specific style exceptions without explicit reason

## 9) Sync Policy
When design rules change, update together:
- `frontend/AGENTS.md`
- `frontend/guidelines/DESIGN_SYSTEM.md`
- `frontend/guidelines/LAYOUT_GUIDELINES.md`
