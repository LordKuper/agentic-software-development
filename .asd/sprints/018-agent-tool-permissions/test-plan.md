---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 018-agent-tool-permissions

## Entry log

Appended each entry, never rewritten. `HEAD analysed` is the commit the strategy/prune passes
were scoped through; the next re-entry's delta is `git diff <this sha>...HEAD`.

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 6c9d8d7 | full change surface |
| 2 | | delta since entry 1 |

## Risk → check decisions

Entry 2 (delta since entry 1: `git diff 6c9d8d7...HEAD`). Impacted set: the **full suite**. The safety valve still fires because the delta touches `providers.md` (every agent's host mapping) and `release-manifest.json`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `providers.md` "Declared tool policy" D-1 fix (0533ef8) | the reviewer carve-out is dropped or reworded out of the refusal line, and a reviewer goes back to returning a bare `QUESTION` | static | none | The entry-1 carriers test already pins it (rotated `test-plan.entry-01.md`). Re-proven on the fix itself: the line reverted to `0533ef8~1` → exit 1, `sprint-018 AC-4/AC-5/AC-7: a reviewer's question and External Review's stalemate …` fails first on "AC-4/AC-5: the out-of-policy refusal must route a reviewer through its question carrier". A new test would duplicate that assertion |
| `asd-phase-audit.md` step 3c D-2 fix (4df9bf4) | the audit workflow loses its `QUESTION` branch, or the branch goes back to relay-halt | static | none | Pinned twice by the entry-1 orchestrator-only test: the dispatcher-citation assert, and the `QUESTION … →` clause sweep, which now reaches step 3c's arrow clause. Re-proven on the fix itself: the file reverted to `4df9bf4~1` → exit 1, `sprint-018 AC-4/AC-5/AC-7: only the main orchestrator prompts the user …` fails on "AC-7: every workflow dispatching a role that can return QUESTION must cite the QUESTION protocol" |
| `release-manifest.json` hash refresh | stale ledger after the two canon edits | static | keep | The existing `upstream_hashes` and `canon_hashes` tests cover it; they pass at dd8f6ba |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

None this entry. Both fixes are guarded by assertions added in entry 1, and each fix was re-proven by reverting the fix commit (`node <scratchpad>/mutate.js F1|F2`, a `git show <sha>~1:<file>` revert restored in `finally` with a byte compare; the worktree was clean of canon edits afterwards).

| Test | Regression proof |
|---|---|

## Suite run

- Command: `node tests/run.js`
- Scope: impacted = full (safety valve: the delta touches `providers.md` and `release-manifest.json`)
- Result: pass — 228/228 passed, 0 failed, 0 skipped (exit 0). Same count at the pre-strategy run (step 3) and at the suite gate (step 8); this entry changed no test code in between
- Lint / build: pass — `git diff --check` exit 0; `node .asd/sync.js --check` exit 0, `"ok": true`
- HEAD: dd8f6ba

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/rules/providers.md | AssertionError [ERR_ASSERTION]: AC-4/AC-5: the out-of-policy refusal must route a reviewer through its question carrier - "an agent ... returns `QUESTION`" alone makes a reviewer return a bare QUESTION, which reads as an interrupted dispatch | sprint-018 AC-4/AC-5/AC-7: a reviewer's question and External Review's stalemate ride the verdict-bearing report - one carrier form across template, rule, agents and both review workflows - and impl-review collects manual-verification results before dispatching the testing reviewer | fixed | 0533ef8 |
| D-2 | 1 | .asd/workflows/asd-phase-audit.md | AssertionError [ERR_ASSERTION]: AC-7: every workflow dispatching a role that can return QUESTION must cite the QUESTION protocol, or that question has no handling path in the phase | sprint-018 AC-4/AC-5/AC-7: only the main orchestrator prompts the user - core.md says so, the QUESTION protocol carries every dispatched question, every creator/dev/tester-dispatching workflow cites it, and no agent body, skill or design step hands user contact to a dispatched agent | fixed | 4df9bf4 |
