# Test plan — entry 3 (rotated segment)

Rotated from `test-plan.md` at entry 4's strategy pass (`artifact-layout.md` "Test plan" rotation). A cross-span reader reads this segment in ordinal order, then the live file.

Carried from the live file's preamble; it records entry 3's pre-strategy run:

Entry 3 pre-strategy run at `032357a`: `node tests/run.js` → exit 0, `223/223 passed`.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| COR-4 memory rewrites under `.claude/agent-memory/{asd-external-review,asd-reviewer-correctness,asd-reviewer-documentation,asd-reviewer-efficiency}/` | memory is loaded on every dispatch, so a line that still describes split parts, `--halve`, the out-of-part predicate or `exclude_paths` as current reloads a false contract. This is a real risk: COR-4 found it, and one owner, `asd-reviewer-testing`, was missed. A later memory write can also bring it back | static | add | COR-4 is a fixed defect, so `code-style.md` §17 requires a regression check, and entry 2 had no COR-4 row. The AC-5 canon sweep does not reach memory. A second sweep over the memory dirs of every roster agent now uses the canon sweep's needle set, which is extracted into the shared `REPLACED_REVIEW_MECHANISMS`. Memory lines are allowed to say a mechanism is absent (e.g. "no `.part-N`"), so a term passes when a negation comes right before it in the same clause (40-char window) or the line says legacy. A negation word anywhere on the line would exempt too much. |
| `tests/run.js` from 95aee62 (review-fix tester chain) | tests written outside impl-test's own pass (F-3) might lack their proof | — | none | Entry 2 (`test-plan.entry-02.md`) already analysed this commit and recorded a mutation proof for each added or updated test. The pre-strategy run is green at 223/223. The one gap found, no COR-4 row, is closed by the row above, so there is no re-analysis. |
| `REPLACED_REVIEW_MECHANISMS` extraction in the AC-5 canon sweep | the canon sweep changes behaviour | refactor, no new test | keep | The canon sweep reads the same regexes from the constant. Its behaviour is unchanged, and it stays green before and after the extraction. |

## Removed tests

None this entry.

## Added tests

| Test | Regression proof |
|---|---|
| `tests/run.js:sprint-017 AC-5/AC-7 (COR-4): no agent memory a dispatched agent loads names a review mechanism review waves replaced as live - only right after a negation in the same clause, or on a line naming it legacy` | Mutation: restore the pre-COR-4 text of the 11 memory files COR-4 rewrote (`git show a866c4c:<f> > <f>`), then run `node tests/run.js` → exit 1. This test FAILs with 23 leftovers, 16 more than the 7 at HEAD (D-1/D-2), and they span all four COR-4 owners' dirs. The files were restored in the same command with `git checkout -- <f>`, and `git status --short .claude/agent-memory` was empty afterwards. At HEAD the test is red only on D-1/D-2 |
