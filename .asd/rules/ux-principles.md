# UX Principles

Apply to UX-spec and mockup authoring. Verify under UI conformance with `asd-reviewer-quality` (Standard impl-review) or `asd-reviewer-combined` (Standard design-review, Lite impl-review).

## 1. Readability over Decoration

Interface MAY be atmospheric, MUST NOT block user from reading critical data. Decor never reduce contrast, fragment panel shape, or obscure key state.

## 2. Visual Hierarchy follow Importance

Most prominent ≠ most pretty. Most prominent = most decision-critical. Order:

1. Critical alerts (irreversible, immediate action)
2. Resource/state shortages blocking user goals
3. Risks to ongoing user work
4. Stopped key processes
5. Important events
6. Current selection
7. Reference info

## 3. Progressive Disclosure

For every alert, empty state or error, show state → reason → consequence → action.

## 4. Cross-Theme Consistency

User MUST NOT relearn UI after theme/mode/variant switch. Theme may restyle surface; theme may NOT relocate HUD elements, change hit targets, change interaction patterns, or remap status colors. Enforced by `design-system.md` §9.

## 5. Minimal HUD

Persistent HUD show only what user need always-on or urgently. Do NOT put: detailed tables, long descriptions, secondary settings, rare actions. Push those into panels/menus.

## See also

- `design-system.md` — token rules, theme rules
- `design-principles.md` — engineering-side principles
- `core.md` — Simplicity Default
- `review-policy.md` — UI review checklist
