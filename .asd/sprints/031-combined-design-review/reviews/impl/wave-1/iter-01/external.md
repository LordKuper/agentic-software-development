[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01
- **Severity floor (this iter)**: low

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | .asd/rules/review-policy.md:195 | codex F1 (minor). The Efficiency row's impl-review cell still reads "the same plus test-suite cost and performance". Its design-review cell now says "judged by Combined" instead of the concern list, so "the same" has no antecedent. The sole owner map no longer states what Efficiency judges in impl-review. Verified against the merge-base version, where the design-review cell held the list. | Name Efficiency's rubric concerns in the impl-review cell, or restore the list there. Avoid "the same" pointing at a delegated cell. |
| 2 | medium | README.md:253 | codex F2 (minor). The "Diff-scoped rubric-section gating" paragraph now includes `standard`'s design-review (Combined) but states impl-review-only gating rules. Its SSoT is `asd-phase-impl-review.md` step 5, and it uses scope-list and executable-file predicates. A design draft such as `design-md-delta.yaml` is not covered by those rules, so the paragraph misdescribes design-review gating. | Keep this paragraph scoped to impl-review (including `lite`'s Combined). Describe design-review's draft-based UI gate separately, or point to the workflow step that owns it. |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: none

## Verdict
CONCERNS: 2

## Next action
Route both findings to impl review-fix, then run the next iteration. Codex could not run `node tests/run.js` in the read-only sandbox, so test results are unverified by this review.
