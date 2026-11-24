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

No raw hex / px / rem / font-family in UI code or local mockups. Always use token references. Exception: the DESIGN.md primitive layer. Figma bindings and token references follow §12.

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

Scope: the design-system gate, `design-md-delta.yaml`, DESIGN.md / design-system.html / accessibility.html promotion and the `designmd-*` commands run only when `documents.design_system` is enabled. Propose token deltas for affected UI. Mockups follow the frozen mode independently of the UX-spec (`sprint-lifecycle.md` "Mockup format").

- **Precondition**: mockups require an accepted `DESIGN.md`, `design-system.html` and `accessibility.html`. If missing, halt authoring and establish the baseline via `/asd-design-system`. With the sprint design-system document disabled, use existing tokens. A needed delta requires enabling the sprint design-system document or narrowing the mockup to approved tokens.
- **Token decisions**: never use a missing, insufficient, new or changed token undecided. Put every such proposal into one decision under `checkpoints.md` (adaptive or strict), append each approved token to the sprint's `design-md-delta.yaml` before a mockup or code uses it. No separate unconditional token pause. Lite design-promote: a token the implementation added or changed passes the same decision before `DESIGN.md` is patched.
- **Delta prose**: `design-md-delta.yaml` carries a `prose` section of DESIGN.md Markdown text (Overview, Do's and Don'ts, …), applied at `design-promote` beside the token changes.
- **Mockups.** Mode `none` skips authoring. Otherwise author affected UI screens and applicable states (including empty, loading and error) at Lite scope or Standard design. Use `DESIGN.md` and approved delta tokens. Keep mockups in `<sprint>/design/mockups/` and give that folder to Dev and reviewers. UX specs may link to mockups. Promotion copies in-scope files to `docs/ux/mockups/` (decomposition: `mockups/<subsystem>/`), rewrites relative links as needed and preserves remote URLs.
  - `html`: write an interactive local `<screen>.html` per screen or state (`t_html-shell.html`).
  - `claude_design`: with Claude Code's Artifact tool available, save one subfolder per canvas with `project/canvas.json` and `project/*.dc.html`, publish from those files under `checkpoints.md` "Gate inventory" and link each canvas from `mockups/index.md`. Otherwise use local HTML. In Lite, follow "Claude Design Lite publication and recovery" below.
  - `figma`: use "Figma publication and recovery" below. Link the Design file in `mockups/index.md`. Each frame entry carries the frame URL, verified revision, screen/state, structure, component references and token references for handoff, including the applied token for each property without binding support. A successful Figma mockup needs only this local index.
- **Figma publication and recovery.** Confirm the supplied Design file. When none is supplied, obtain explicit approval for a new named file and its plan. Apply the external-action gate (`checkpoints.md` "Gate inventory") to file creation and canvas writes. Use `author Figma Design mockups` (`providers.md` "Semantic operations -> host convention"). Create editable frames with the applicable design system. Reuse matching linked component instances and variable/style bindings. If a binding is missing, map the approved token to a local variable or style where supported.
  - Before each external write, log the phase, mockup revision, authorized destination (plan and name for creation, file key and location for canvas writes), intended screen/state identities, known node IDs and intended token references for properties without binding support. Use identifiable sprint-scoped frame names for recovery. Verify the resulting change by reading it back. Start each frame's verified revision at 1 and increment it for every verified change to that frame, including edits that preserve its node URL. Record the outcome, file identity and link, and exact full entry for each verified frame in the decisions log before updating the index.
  - On re-entry, read the live and rotated decisions log before acting. Reuse the confirmed file and restore complete entries for the latest verified frame revisions of the current publication. For an incomplete record, verify missing fields from existing index content, logged intent and approved design sources, reading the frame back as needed. Append the completed entry before updating the index. Keep recovery pending if required metadata remains unverified. After an uncertain write, check the destination for the recorded identity and verify the resulting file or frames before marking them complete. Reuse recovered identities for any remaining work; create again only after confirming the previous creation did not take effect. An unresolved outcome stays uncertain.
  - When writing is unavailable, fails or remains uncertain, record the evidence and use `request user decision` to offer temporary local HTML or wait for access. Log the choice and publication status before continuing with linked local HTML or pausing the current phase. Preserve the configured and frozen formats. Re-entry honors the recorded choice for that revision and checks the prior outcome before any retry.
- **Claude Design Lite publication and recovery.** Before each attempt, append the canvas source directory, source revision, phase and intended publication target to the sprint decisions log, including any known artifact identity. On success, record the returned artifact link before updating `mockups/index.md`. On canvas-host reachability failure at scope, record deferred publication and the failure evidence. Keep the source and link reviewable local previews in the index, using the local HTML form if needed. Scope can proceed to acceptance. On re-entry, check the live and rotated log for that source revision. Reuse a recorded successful link, including when rebuilding the index. If an attempt has an uncertain outcome, recover its link from the host or establish that it did not publish before sending another request. If the outcome remains uncertain, keep the local previews and record that result. At design-promote, retry a confirmed unpublished deferred canvas once per accepted source revision, with `claude_design` selected, the Artifact tool available and the publication gate satisfied. When a retry fails or cannot run, record the reason and promote the local previews.
- **Accessibility**: a ux-spec never carries a11y rules; project-wide `accessibility.html` owns them.
- **DESIGN.md spec**: fetch the latest Google Labs spec before editing when the cached one is stale; the fetch failing twice halts the step. The web is limited to that spec.
- **Tool bounds**: `designmd-install` runs once per session as a no-save install (`npm install --no-save`), never changing `package.json` or the lockfile; `designmd-lint`, `-diff`, `-export` per §10-§11; the `design.md` binary never inline.
- **Regeneration**: `design-system.html` is regenerated per §10 step 4 with color swatches, typography samples, spacing scale, component previews, UI composition preview and the full token reference. The token reference rows and the CSS variables are never hand-written: `node .asd/runtime.js design-tokens --design <DESIGN.md> --html <design-system.html>` rebuilds the regions between the `asd:tokens` (HTML comment) and `asd:vars` (CSS comment) markers from DESIGN.md, run by `design-promote` and `/asd-design-system` after the other sections are written.

## See also

- `core.md` — Simplicity Default
- `design-principles.md` — KISS, SSoT
- `ux-principles.md` — UX-side principles (readability, hierarchy, disclosure)
- `review-policy.md` — over-engineering, severity floor
- `artifact-layout.md` — DESIGN.md path, SSoT iron rule
