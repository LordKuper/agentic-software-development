# Test plan segment — sprint 029-upstream-retro-issues, entry 2

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Review-fix canon edits F-1..F-7, X-1, X-2 (`-R` on every gh issue call, backlog-duplicate `-r duplicate`, closed comparison list, "missing release and issue-close steps" wording, impl step 10 pointer, retro title sanitising in gh-2.90.md) | Reworded or added text drifts from its pin, or a gh call regains a missing `-R` | content contract | none | Already pinned by the review-fix tester commit (e20bd5bc: per-assert proofs for F-2, F-3, F-5; renamed wording in sprint-021/022 pins); nothing left uncovered. gh-2.90.md sanitising rule and impl step 10 pointer are prose with no parsed literal |
| asd-phase-retro SKILL `allowed-tools` gains `Bash(gh auth status:*)` and `Bash(gh issue create:*)` (F-1) | A gh call retro step 7 runs is not pre-approved, so the inline step stalls on a permission prompt before any issue is published; the grant list and the step text are two files nothing ties | content contract | add | Review finding evidences the failure mode; the grant set is derived from the `gh <a> <b>` calls in step 7, not enumerated |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | | |

## Added tests

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-029 AC-1/AC-2/AC-3/AC-4/AC-5/AC-6/AC-7/AC-8 contract test, new assert (every gh call in retro step 7 has a `Bash(gh <call>:*)` grant in the retro SKILL) | Mutation: SKILL grant `Bash(gh issue create:*)` removed: `node tests/run.js --filter "sprint-029 AC-1/AC-2"` → exit 1, FAIL sprint-029 AC-1/AC-2/AC-3/AC-4/AC-5/AC-6/AC-7/AC-8 (1 test matched), the AC-1 grants assert reported. Control (grant order swapped, set unchanged): same command → exit 0, 1 test matched. Mutation restored before the next command; runs: 2 (1 mutation + 1 control) |
