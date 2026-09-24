# Test plan — entry 4 (rotated segment)

Rotated from `test-plan.md` at entry 5's strategy pass (`artifact-layout.md` "Test plan" rotation). A cross-span reader reads this segment in ordinal order, then the live file.

Carried from the live file's preamble; it records entry 4's pre-strategy run:

Entry 4 pre-strategy run at `4a1520a`: `node tests/run.js` → exit 0, `224/224 passed`.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| D-1/D-2 fix (ace77e4) under `.claude/agent-memory/asd-reviewer-testing/`: split-part memory deleted, `--halve` anecdote and two other memories rewritten, `MEMORY.md` index updated | a split, part or `--halve` line survives or returns as live contract; the index loses or gains a line without its file | static | none | Existing checks already cover both risks, so no new test qualifies (`code-style.md` §17). The COR-4 memory sweep (entry 3) covers the first. Its fail-first proof against this fix: `git checkout ace77e4^ -- .claude/agent-memory/asd-reviewer-testing`, then `node tests/run.js` → exit 1, `223/224 passed`. The one FAIL is `sprint-017 AC-5/AC-7 (COR-4): no agent memory a dispatched agent loads names a review mechanism review waves replaced as live - only right after a negation in the same clause, or on a line naming it legacy`, with exactly D-1/D-2's 7 leftovers. The dir was restored in the same command (`git restore --source=HEAD --staged --worktree`, re-added file removed), and `git status --short` was empty afterwards. At ace77e4 and later the sweep is green (pre-strategy run above). The second risk is covered by the memory-index bijection test (`T-2/T-4/sprint-010 TST-01`), which caught the fix's own dropped `feedback_value-removal-sprints.md` index line before commit (decisions-log.009.md). |

## Removed tests

None this entry.

## Added tests

None this entry.
