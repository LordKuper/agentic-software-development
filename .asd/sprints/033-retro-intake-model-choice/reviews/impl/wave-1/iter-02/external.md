[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02
- **Severity floor (this iter)**: medium

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | .claude/agent-memory/asd-tester/feedback_failfirst-pre-fix-tree.md:12 | codex F1 (wrapped run, source minor, mapped to medium): line 12 says to extract the pre-fix tree "beside the repo, never inside it", while line 8 says "outside the repo". artifact-layout.md "Scratch directory" requires helper files inside the project under `.asd/tmp/`, never OS temp. Both instructions cannot be followed together. | Extract beneath the git-ignored `.asd/tmp/` and make line 8 consistent with it. |

## Dropped findings (counts only)

- Below severity floor (iter 2, floor medium): 0. The wrapper keeps every finding; `persist-review --floor medium` appends the actual `dropped: <n>` line.
- Nitpick, by category: none reported by codex.

## Verdict
CONCERNS: 1
dropped: 0

resolved: 1 — memory-fix, 2026-11-12
