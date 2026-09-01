[REVIEW-impl-ui]: CONCERNS

# Review — ui
- **Phase**: impl-review
- **Iteration**: 2 (floor = medium)

## Findings
| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `t_html-shell.html:48` vs `:61-63` | `.layout:has(> nav.toc)` (specificity 0,2,1) outranks the 880px media query (0,1,0) — the mobile breakpoint never fires for TOC-bearing documents; also never resets for print. | Add the `:has()` variant to both the media query and `@media print`. |
| 2 | high | `t_html-shell.html:33-42` | Dark-mode override block omits `--neutral`, used by the most common status badge (`draft`) — falls to ~3.3:1 contrast in dark mode, below AA. | Add a dark-mode `--neutral` override ≥4.5:1. |
| 3 | high | `t_adr.html:12-19` vs `artifact-layout.md:126,128` | Multi-ADR articles have no per-decision `<h2>` title even though the doc-meta rule assumes one exists on the article for TOC-entry derivation; heading outline is unusable for multi-decision docs (WCAG 2.4.6). | Add a per-article `<h2>` title, demote section headings to `<h3>`. |
| 4 | medium | `t_adr.html:44` | Related-ADR link uses a bare literal `#adr-N` instead of the template's placeholder syntax — dead anchor if filled literally. | Use `{{target N}}` placeholder syntax with a clarifying comment. |
| 5 | medium | `artifact-layout.md:129`, `t_html-shell.html:48,182` | `{{TOC_ASSETS}}` is correctly conditional/self-contained but its actual content (the TOC CSS+scrollspy script) is defined nowhere in canon — every creator must reinvent it. | Inline the canonical TOC_ASSETS content as a literal fill value in artifact-layout.md's table. |
| 6 | medium | `t_html-shell.html:28,38,120` | `.status-accepted`/`.status-proposed` chips still fail AA contrast in light mode after the token change (~3.9-4.47:1). | Darken light `--ok`, or drop the tint background and rely on border+label. |
| 7 | medium | `t_html-shell.html:28,38` | `--ok-tint`/`--ok-tint-strong` are near-duplicates (0.03 alpha apart, one consumer each); `--danger-tint` has no `-strong` counterpart. | Collapse to one `--ok-tint`; keep the ok/danger pair symmetric. |
| 8 | medium | `t_html-shell.html:37` | Dark-mode collapses `--accent`/`--info`/`--chip-may-fg` to the same value, losing a semantic distinction that exists in light mode. | Give dark `--info` its own distinct value. |
| 9 | medium | `asd-stack/SKILL.md:129` vs `t_stack.html` | Routes speculative items to a "considered/not adopted" section the template doesn't define. | Add the section to t_stack.html, or repoint to `constraints`/stubs.md. |
| 10 | medium | `asd-frontend-dev.md:41-44,23` | The no-baseline carve-out landed on the UI reviewer but not the UI creator — frontend-dev's inputs assume DESIGN.md/accessibility.html always exist. | Mirror the reviewer's carve-out into frontend-dev. |

## Coverage summary
`files: 34/51 checked, 17 n/a · rules: 9/9, 10 findings`

## Verdict
CONCERNS: 10 (3 high, 7 medium)

## Next action
Route to `impl` review-fix mode. Findings #9,#10 need sync.js --apply (skill/agent files).

## Escalations
- **E-1 (framework defect, user decision needed)**: this reviewer's own `accessibility.html missing → ABORT` guard, carved out only for "no UI surface in scope", is permanently and simultaneously triggered in this self-hosting repo — `.asd/templates/*.html` always matches the UI-surface predicate, while `docs/ux/accessibility.html` can never exist here (`documents.ux_spec: disabled`). Literal reading means this reviewer ABORTs every impl-review of this repo forever. Options: (A) extend the carve-out — when self-hosting and the only UI surfaces are framework templates, review against design-system.md/ux-principles.md + WCAG AA directly (recommended, already done this iteration); (B) broaden the existing no-ux-spec-draft carve-out to "no accessibility baseline exists" generally; (C) leave as-is and rely on scoped_fan_out (doesn't work — the predicate is UI-surface-based, re-triggers every time `.html` templates are in the diff).
