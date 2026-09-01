[REVIEW-impl-ui]: CONCERNS

# Review — ui
- **Phase**: impl-review
- **Iteration**: 3 (floor = high)

## Findings
| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `t_html-shell.html:120` (`--ok` at `:27`) | `.status-accepted` contrast was validated against `--bg` (#fff) but actually renders on `.adr{background:var(--card-bg)}` = #fafbfc — 4.36:1, below AA 4.5:1. | Darken `--ok` to `#1a7f37` (4.90:1 on card-bg). |
| 2 | high | `artifact-layout.md:129` | Same `{{TOC_ASSETS}}` `\n`-escaping bug as quality.md#3 — independently confirmed. Verified: dropping the scrollspy is safe (no dependent code), the `:has()` specificity fix is correct and complete, the dark `--info` value has no collision, and the ADR `<h3>` demotion breaks nothing downstream. | See simplification.md#1 — delete the placeholder, merge CSS into the shell directly. |

## Coverage summary
`files: 33/33 checked, 22 n/a · rules: 7/7, 2 findings`

## Verdict
CONCERNS: 2

## Next action
Route to `impl` review-fix mode.

## Escalations
None.
