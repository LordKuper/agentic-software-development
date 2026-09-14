[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor (this iter)**: low
- **Wrapped provider**: Codex CLI (`gpt-5.6-sol`); preflight `local-ready`. Exempt from the coverage-ledger gate. Scope: [external.scope.json](./external.scope.json)

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| EXT-1 | high | `.asd/workflows/asd-phase-audit.md` steps 1 and 5; `.asd/rules/sprint-lifecycle.md` "Optional documents"/"Multi-phase skip"; `.asd/skills/asd-sprint/SKILL.md:43` | Step 1 still says "record it" for a mechanically skipped audit (`documents.audit=false`). Under the general no-op rule, that record is its own write: it advances `phase` and appends `"audit"`. Step 5's true branch is a second, independent write: it sets `phase="design-promote"` and appends the fixed three-name array. With `documents.audit=false` and `skip_design_phases=true` (orthogonal fields), the skip therefore takes two non-atomic writes, contradicting AC-3's "One write". An interruption between them leaves the step-1 state on disk. Resume then re-enters it and dispatches `asd-phase-design`, which AC-3/AC-5 forbid. No sprint-011 test covers this combination. (Codex raised this as F1; the wrapper verified it against source and relocated the root cause to the audit two-write sequence.) | Make step 5 the sole write site for every combination. When `documents.audit` was false, fold `"audit"` into step 5's single append: `["audit"]` when `skip_design_phases` is false, `["audit","design","design-review","design-promote"]` when true. Rephrase step 1 so it no longer implies a separate write. Add a test for `documents.audit=false` + `skip_design_phases=true` that asserts a single write and the combined array. |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: none: 0

## Verdict
CONCERNS: 1

## Next action
Dev: make audit step 5 the single write site for the audit-off plus setting-on combination, add a test for it, then re-enter impl-review.
