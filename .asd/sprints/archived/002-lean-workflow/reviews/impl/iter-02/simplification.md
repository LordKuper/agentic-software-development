[REVIEW-impl-simplification]: CONCERNS

# Review — simplification
- **Phase**: impl-review
- **Iteration**: 2 (floor = medium)

## Findings
| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `t_html-shell.html:182`, `artifact-layout.md:129` | `{{TOC_ASSETS}}` relocated complexity instead of removing it — declared but content defined nowhere in canon, forcing every creator to hand-invent sticky-sidebar CSS+scrollspy JS. | Put the TOC block back verbatim as the literal fill value (or drop the scrollspy script entirely — a sticky nav needs no JS). |
| 2 | high | `asd-phase-impl-test/SKILL.md:5` | Same impl-test Write/Edit gap — third independent confirmation this iteration. | Add Write Edit; sync.js --apply. |
| 3 | medium | `asd-pm.md:85`, `asd-phase-design-review.md:15,26`, `asd-phase-impl-review.md:13,15,24,32` | Writer attribution stale at 3 sites the Task-15 conversion touched — still says PM writes where the workflow itself now writes inline. | Add "inline (mechanical, no gate)" marker consistently; update asd-pm.md's no-op exception text. |
| 4 | medium | `external-review.md:17-18,22-26` | Duplicated wrapped-CLI command tails already drifted from the agent's own (correct) copy that added read-only flags. | Replace with a pointer to the agent's `wraps_invoke_args`. |
| 5 | medium | `t_review.md:49-51`, `asd-reviewer-testing.md` (4 sites), `asd-test-engineer.md` (2 sites) | Manual-verification single-home rule now restated ~7 times across canon. | Delete the redundant copies, keep artifact-layout.md as SSoT + one pointer per consumer. |
| 6 | medium | `asd-reviewer-testing.md:84`, `asd-reviewer-documentation.md:89` | Same hardcoded floor-suppression line as quality.md#4. | Delete. |
| 7 | medium | `sprint-lifecycle.md:182`, `asd-phase-impl-test.md:63` | Residual "(audit R-15)" sprint-local id citations survive the id-strip pass. | Drop the parentheticals, keep the rationale prose. |

## Coverage summary
`files: 51/51 checked, 0 n/a · rules: 17/17, 7 findings`

## Verdict
CONCERNS: 7 (2 high, 5 medium)

## Next action
Route to `impl` review-fix mode. Finding #2 needs sync.js --apply.

## Escalations
None.
