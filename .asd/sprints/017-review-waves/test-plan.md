---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 017-review-waves

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 8b0c28f58ee83940449709bfdba3a35814daf987 | full change surface |
| 2 | a866c4c8b94c0ec9ea8f5f8f7e5139fd0df5ac50 | dev-chain review-fix delta since entry 1 (testing.md TST-1..TST-3, efficiency.md EFF-4, plus the dev-chain commits `8b0c28f..a866c4c` those findings' fixes touch) |
| 3 | ee7333e334510ce3233afdcd7c7bf9d6837f7215 | delta since entry 2: `tests/run.js` (95aee62, review-fix tester chain) and `.claude/agent-memory/**` (COR-4 memory rewrites, 30f75c3 and e4dd2c0) |
| 4 |  | delta since entry 3: `.claude/agent-memory/asd-reviewer-testing/**` (D-1/D-2 test-fix, ace77e4) |

Impacted set: full suite (all entries). The safety valve fires. Entries 1-2 touched `.asd/runtime.js`, `.asd/hooks/session-start.js`, `.asd/release-manifest.json`, rule docs and workflows, and entry 3's delta touches `tests/run.js`, the runner itself. `commands.yaml` has no `test_affected`. Entry 4's delta is memory only, but its search-derived set (the tests walking `.claude/agent-memory/**`) lives in the one test file `tests/run.js`, which the runner executes whole.

Entry 3's `Risk → check decisions`, `Removed tests` and `Added tests` rows are rotated to `test-plan.entry-03.md`. Entries 1-2 are in `test-plan.entry-01.md` and `test-plan.entry-02.md` (`artifact-layout.md` "Test plan"). This entry's own rows follow.

Entry 4 pre-strategy run at `4a1520a`: `node tests/run.js` → exit 0, `224/224 passed`.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| D-1/D-2 fix (ace77e4) under `.claude/agent-memory/asd-reviewer-testing/`: split-part memory deleted, `--halve` anecdote and two other memories rewritten, `MEMORY.md` index updated | a split, part or `--halve` line survives or returns as live contract; the index loses or gains a line without its file | static | none | Existing checks already cover both risks, so no new test qualifies (`code-style.md` §17). The COR-4 memory sweep (entry 3) covers the first. Its fail-first proof against this fix: `git checkout ace77e4^ -- .claude/agent-memory/asd-reviewer-testing`, then `node tests/run.js` → exit 1, `223/224 passed`. The one FAIL is `sprint-017 AC-5/AC-7 (COR-4): no agent memory a dispatched agent loads names a review mechanism review waves replaced as live - only right after a negation in the same clause, or on a line naming it legacy`, with exactly D-1/D-2's 7 leftovers. The dir was restored in the same command (`git restore --source=HEAD --staged --worktree`, re-added file removed), and `git status --short` was empty afterwards. At ace77e4 and later the sweep is green (pre-strategy run above). The second risk is covered by the memory-index bijection test (`T-2/T-4/sprint-010 TST-01`), which caught the fix's own dropped `feedback_value-removal-sprints.md` index line before commit (decisions-log.009.md). |

## Removed tests

None this entry.

## Added tests

None this entry.

## Suite run

- Command: `node tests/run.js`
- Scope: full (safety valve, see Entry log)
- Result: pass — `224/224 passed`, 0 failed, 0 skipped (exit 0). The runner has no skip state. Its one `(skipped: … only runs on win32 …)` line is a pre-existing in-test platform branch, not a skipped test.
- Lint / build: pass — `git diff --cached --check` exit 0 on the staged change; `node .asd/sync.js --check` exit 0, `ok: true`
- HEAD: 4a1520ad359f8196ac162f75e587c72e054368eb — the working tree plus this entry's staged `test-plan.md` and `test-plan.entry-03.md`, committed right after as the entry's test commit

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 3 | `.claude/agent-memory/asd-reviewer-testing/project_split-part-rubric-rows.md` | AssertionError [ERR_ASSERTION]: COR-4/AC-7: agent memory is loaded on every dispatch, so a line describing a removed split, part or External batch as current contract reloads a false contract that "Scope hand-off" and the wave state contradict. A memory may name one only as absent ("no .part-N") or legacy; its owner rewrites or deletes the rest | sprint-017 AC-5/AC-7 (COR-4): no agent memory a dispatched agent loads names a review mechanism review waves replaced as live - only right after a negation in the same clause, or on a line naming it legacy | fixed | ace77e4 |
| D-2 | 3 | `.claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md` | AssertionError [ERR_ASSERTION]: COR-4/AC-7: agent memory is loaded on every dispatch, so a line describing a removed split, part or External batch as current contract reloads a false contract that "Scope hand-off" and the wave state contradict. A memory may name one only as absent ("no .part-N") or legacy; its owner rewrites or deletes the rest | sprint-017 AC-5/AC-7 (COR-4): no agent memory a dispatched agent loads names a review mechanism review waves replaced as live - only right after a negation in the same clause, or on a line naming it legacy | fixed | ace77e4 |

D-1: the whole memory, lines 3/8/12/14, describes split testing parts as the current contract, and its `MEMORY.md` index line points to it. D-2: line 32's sprint-012 anecdote says `--halve` is passed on interruption. Both files belong to `asd-reviewer-testing`. No impl role may write them, and that reviewer has no write tool (friction F-2/F-4), so the fix needs the COR-4 route: the owner supplies the text.
