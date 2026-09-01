[REVIEW-impl-simplification]: CONCERNS

# Review — simplification
- **Phase**: impl-review
- **Iteration**: 3 (floor = high; over-engineering/structure checklist hits always reported)

## Findings
| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | critical | `artifact-layout.md:129`, `t_html-shell.html` | `{{TOC_ASSETS}}` doesn't earn its weight — abstraction with exactly one possible fill value, stored escaped in a markdown table (feeds the `\n`-escaping bug), emitting a second `<style>` element into an otherwise self-contained document, when the shell already ships ~100 lines of unconditional per-fragment CSS anyway. | Delete `{{TOC_ASSETS}}` and its table row entirely. Move the ~10 `nav.toc{...}` rules directly into `t_html-shell.html`'s existing `<style>` block, unconditional, next to the `.layout:has(>nav.toc)` rule already there. |
| 2 | high | `t_adr.html:10` | Stale comment still says ids "feed the shell's per-article TOC/scrollspy" — no scrollspy exists anywhere in canon anymore. | Rewrite: "ids are the anchor targets for the shell's per-article TOC entries". |
| 3 | high | `asd-phase-impl-review.md:31` + `asd-reviewer-ui.md:23` | UI-surface predicate defined verbatim in two homes — divergence risk (exactly the pattern Task 19 fixed elsewhere in this same sprint). | Keep the list in `asd-phase-impl-review.md` step 5 only; reduce the reviewer's carve-out to a pointer. |
| 4 | medium | `sprint-lifecycle.md:174-178`, `asd-test-engineer.md`, `asd-phase-impl-test.md`, `asd-reviewer-testing.md` | Test-selection rule set (check ladder, prune criteria, fail-first proof) restated in 5 homes — largest remaining duplication in this sprint's own touched surface. Reported regardless of floor (SSoT always-reported). | Keep `code-style.md §17` as sole home (already declared as such at `sprint-lifecycle.md:172`), reduce the other 4 to pointers. |

## Verifications
`iteration_heads` confirmed NOT premature (real caller, minimal shape, correctly asymmetric vs design-review, though back-compat gap = quality.md#1/external.md#1). Round-2 TOC_ASSETS fix confirmed a genuine simplification in intent (scrollspy really is gone) but incomplete (findings #1, #2 above).

## Coverage summary
`files: 33/33 checked, 0 n/a · rules: 11/18 pass, 7 n/a, 4 findings`

## Verdict
CONCERNS: 4

## Next action
Route to `impl` review-fix mode. Findings #1/#2 land together (deleting the placeholder resolves the stale reference's underlying mechanism too).

## Escalations
None — every fix is a deletion or pointer, no new abstraction.
