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
| 2 | 67cc9a8 | delta since entry 1 |
| 3 | 0bd998c | delta since entry 2 |
| 4 | 7d16856 | delta since entry 3 |
| 5 | b986d17 | delta since entry 4 |
| 6 | 0fcc88c | delta since entry 5 |
| 7 | | delta since entry 6 |

## Risk → check decisions

Entry 7 (delta since entry 6: `git diff 0fcc88c...HEAD`, the D-3 test-fix: cee9c09 plus bookkeeping f005259). Impacted set: the **full suite**. The safety valve fires because the delta touches `sprint-lifecycle.md` and `release-manifest.json`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| cee9c09: `sprint-lifecycle.md` "APPROVE latch" **Invariant** now reads verdicts "alone, except per "State recovery" "User-resolved findings"" (D-3 fix) | the carve-out is dropped again, and the latch invariant goes back to saying DoD/pr-gate read verdicts alone | static | none | Already pinned by entry 6's verdict-only sweep (rotated `test-plan.entry-06.md`). Re-proven on the fix: `sprint-lifecycle.md` reverted to `cee9c09~1` (`MUT=./mut8.js node <scratchpad>/mutate.js`, restored with a byte compare) → exit 1, 227/229, `sprint-018 AC-4: a finding the user resolves without a fix …` fails on "AC-4 (104feda): a line saying a consumer reads verdicts["iter-NN"] alone must carry the user-resolved exception". A new test would duplicate that assertion |
| `release-manifest.json` hash refresh | stale ledger | static | keep | The existing `upstream_hashes` and `canon_hashes` tests pass |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

None this entry: the D-3 fix is guarded by entry 6's assertion, re-proven above.

| Test | Regression proof |
|---|---|

## Suite run

- Command: `node tests/run.js`
- Scope: impacted = full (safety valve: the delta touches `sprint-lifecycle.md` and `release-manifest.json`)
- Result: pass — 229/229 passed, 0 failed, 0 skipped (exit 0), at both the pre-strategy run (step 3) and the suite gate (step 8). This entry changed no test code
- Lint / build: pass — `git diff --check` exit 0; `node .asd/sync.js --check` exit 0, `"ok": true`
- HEAD: 2b343aa

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/rules/providers.md | AssertionError [ERR_ASSERTION]: AC-4/AC-5: the out-of-policy refusal must route a reviewer through its question carrier - "an agent ... returns `QUESTION`" alone makes a reviewer return a bare QUESTION, which reads as an interrupted dispatch | sprint-018 AC-4/AC-5/AC-7: a reviewer's question and External Review's stalemate ride the verdict-bearing report - one carrier form across template, rule, agents and both review workflows - and impl-review collects manual-verification results before dispatching the testing reviewer | fixed | 0533ef8 |
| D-2 | 1 | .asd/workflows/asd-phase-audit.md | AssertionError [ERR_ASSERTION]: AC-7: every workflow dispatching a role that can return QUESTION must cite the QUESTION protocol, or that question has no handling path in the phase | sprint-018 AC-4/AC-5/AC-7: only the main orchestrator prompts the user - core.md says so, the QUESTION protocol carries every dispatched question, every creator/dev/tester-dispatching workflow cites it, and no agent body, skill or design step hands user contact to a dispatched agent | fixed | 4df9bf4 |
| D-3 | 6 | .asd/rules/sprint-lifecycle.md | AssertionError [ERR_ASSERTION]: AC-4 (104feda): a line saying a consumer reads verdicts["iter-NN"] alone must carry the user-resolved exception - read literally, it blocks a user-resolved CONCERNS/FAIL forever | sprint-018 AC-4: a finding the user resolves without a fix is recorded by one resolved: line form, every resolving site and the review-fix collector cite its one home, and review-fix skips what it names | fixed | cee9c09 |
