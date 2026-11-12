# Design System Rules

Binding for the main orchestrator (author) and the UI conformance verifier — the Quality rubric's UI conformance section, applied by `asd-reviewer-quality` (standard impl-review) or `asd-reviewer-combined` (standard design-review, lite impl-review). Applies whenever `DESIGN.md`, `design-system.html`, or UI code touched.

## 1. Source of Truth

`docs/ux/DESIGN.md` = SSoT for tokens, components, states, theme rules. Conflict between mockup, spec, and DESIGN.md → DESIGN.md win until explicitly changed.

## 2. Token Layers

Four layers, build UI on the upper layers:

- **primitive** — raw values (`stone-900`, `spacing-sm`). Not used direct in UI. Feed semantic layer.
- **semantic** — purpose tokens (`text-primary`, `surface-raised`, `danger`). Most UI build on these.
- **state semantic** — domain/app state tokens (`status-critical`, `mode-locked`). Used when state drive user decision.
- **component** — per-component tokens (`button-primary`, `panel-default`). Used when component repeat across screens.

## 3. Token Naming

Name describe purpose, not look. Good: `button-danger`, `surface-panel`, `text-muted`. Bad: `red-button`, `nice-brown`, `dark-thing`, `big-padding`.

Test: rename underlying color → token name still true? If `red-button` cannot turn yellow without absurd, name bad. Use `button-danger`.

**Subsystem prefix** (`project.subsystem_decomposition: enabled`): a token only one subsystem uses is named `<subsystem>-<purpose>` inside the spec's existing groups (`colors.billing-status-due`), never a new top-level group, which the spec leaves undefined. A token two or more subsystems use stays unprefixed.

## 4. Token Usage Comment

Every token MUST carry inline YAML comment: where + when used. One line. No essay.

```yaml
button-danger: "#c0392b"   # primary destructive actions (delete, discard, irreversible ops)
surface-raised: "#2a2a2a"  # elevated panels, modals, popovers
```

Comment absent → reviewer CONCERNS. Comment that only restates name (`button-danger: # danger button`) → reviewer CONCERNS.

## 5. Token Add Checklist

Add token only if ALL true:

- used >1 place OR express important state OR vary by theme
- has clear semantic role
- no existing token cover it
- name describe purpose, survive color/theme change
- has usage comment (rule 4)

Reject if: one-off decoration, experimental, near-duplicate of existing, illustration-only, no UX impact.

## 6. No Hardcoded Values

No raw hex / px / rem / font-family in UI code **or ux-spec mockup previews**. Always token reference. Exception: DESIGN.md primitive layer itself.

**`self_hosting: enabled`, no DESIGN.md** (sole statement of this carve-out): `t_html-shell.html`'s whole `<style>` block is that template's own primitive layer, so §6 reaches only COLOR values outside its `:root`/`prefers-color-scheme` token blocks — consuming rules must use `var(--*)` for color, the token-block definitions themselves are never a finding. Raw px/rem/font-family in that block are exempt: the repo has no spacing/typography token layer for them to violate. Fragment templates (`t_adr.html` etc., no `<style>` of their own) stay fully subject to §6.

## 7. Component States

Every interactive component declare: `default`, `hover`/`focus`, `pressed`, `disabled`. Add `selected` if applicable, `danger` if destructive.

Disabled state MUST show reason ("Need 5 X, have 2"). Plain grey button with no explanation = reviewer CONCERNS.

## 8. Notification Levels

Four levels: `info`, `positive`, `warning`, `critical`. Critical rare — if everything critical, user ignore all. Reserve `critical` for irreversible / immediate-action events.

## 9. Theme / Variant Rules

Theme (skin, era, mode) MAY change: decorative frames, surface texture, accent material, iconography motif, fonts.

Theme MUST NOT change: grid, component size, hit targets, base spacing, notification levels, danger/warning/success semantics, interactive behavior, primary screen structure.

## 10. Process for Add or Edit

1. Find existing token/component fitting need.
2. If none, run checklist (rule 5).
3. Add to DESIGN.md with usage comment (rule 4).
4. Regen `design-system.html` once per sprint, at `design-promote`, and only if `DESIGN.md` was actually touched this sprint — never per individual token edit, never left unconditional.
5. Run `designmd-lint`.
6. Verify contrast and accessibility (`accessibility.html`).
7. Update consumer components to reference new token.

## 11. Linter Pass Criteria

`designmd-lint` result with ≥1 **error** OR ≥1 **warning** (not in exclusion list) = not clean → fixes required, re-lint. Clean pass = zero errors + zero un-excluded warnings.

Errors never excludable. Each **warning** exclusion MUST be user-approved (request user decision) and the decision + short rationale recorded in DESIGN.md (lint-exclusions block). The UI conformance verifier raises CONCERNS if an excluded warning lacks recorded rationale.

A token a script or theme switch selects at runtime, referenced by no component, trips the `orphaned-tokens` warning: its exclusion is an `orphaned-tokens` list in the lint-exclusions block, one line per token naming the runtime selector, approved like any warning exclusion.

## 12. Authoring, token decisions, rule survival

Scope: the design-system gate, `design-md-delta.yaml`, DESIGN.md / design-system.html / accessibility.html promotion and the `designmd-*` commands run only when `documents.design_system` is enabled; `documents.ux_spec` gates only the sprint ux-spec draft and persistent ux-spec docs (`sprint-lifecycle.md` "Optional documents"). Whenever a sprint touches UI the orchestrator proposes token deltas.

- **Precondition**: any of `DESIGN.md`, `design-system.html`, `accessibility.html` missing → halt, run `/asd-design-system`; never author mockups against missing tokens.
- **Token decisions**: never use a missing, insufficient, new or changed token undecided. Put every such proposal into one decision under `checkpoints.md` (adaptive or strict), append each approved token to the sprint's `design-md-delta.yaml` before a mockup or code uses it. No separate unconditional token pause. Lite design-promote: a token the implementation added or changed passes the same decision before `DESIGN.md` is patched.
- **Delta prose**: `design-md-delta.yaml` carries a `prose` section of DESIGN.md Markdown text (Overview, Do's and Don'ts, …), applied at `design-promote` beside the token changes.
- **Mockups** (only with `documents.ux_spec` enabled; `lite`: made at scope): each modified screen or state is an interactive HTML/CSS mockup using only tokens in `DESIGN.md` or the delta, with its states (empty, loading, error) where it has them. Home `<sprint>/design/mockups/`, promoted to `docs/ux/mockups/` (decomposition: `mockups/<subsystem>/`). Claude Code with the Artifact tool: one subfolder per Design canvas holding `project/canvas.json` and `project/*.dc.html`, published from it, plus `mockups/index.md` linking each canvas; otherwise one `<screen>.html` per screen or state (`t_html-shell.html`). Dev and reviewers receive the folder as an input.
- **Accessibility**: a ux-spec never carries a11y rules; project-wide `accessibility.html` owns them.
- **DESIGN.md spec**: fetch the latest Google Labs spec before editing when the cached one is stale; the fetch failing twice halts the step. The web is limited to that spec.
- **Tool bounds**: `designmd-install` runs once per session as a no-save install (`npm install --no-save`), never changing `package.json` or the lockfile; `designmd-lint`, `-diff`, `-export` per §10-§11; the `design.md` binary never inline.
- **Regeneration**: `design-system.html` is regenerated per §10 step 4 with color swatches, typography samples, spacing scale, component previews, UI composition preview and the full token reference. The token reference rows and the CSS variables are never hand-written: `node .asd/runtime.js design-tokens --design <DESIGN.md> --html <design-system.html>` rebuilds the regions between the `asd:tokens` and `asd:vars` markers from DESIGN.md, run by `design-promote` and `/asd-design-system` after the other sections are written.

## See also

- `core.md` — Simplicity Default
- `design-principles.md` — KISS, SSoT
- `ux-principles.md` — UX-side principles (readability, hierarchy, disclosure)
- `review-policy.md` — over-engineering, severity floor
- `artifact-layout.md` — DESIGN.md path, SSoT iron rule
