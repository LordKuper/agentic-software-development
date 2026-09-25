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
| 6 | | delta since entry 5 |

## Risk → check decisions

Entry 6 (delta since entry 5: `git diff b986d17...HEAD`, review-fix round 4: dev d62412e, 104feda). Impacted set: the **full suite**. The safety valve fires because the delta touches `review-policy.md` and `release-manifest.json`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| d62412e: a reviewer's out-of-policy refusal becomes a finding at the dispatch payload, which its question names (`review-policy.md` carrier) | the clause is deleted, and the two pinned rules "a reviewer refuses via its carrier" (providers.md) and "no finding, no question" contradict each other: the refusal can no longer reach the user | static | add (carriers test) | Some sentence of the carrier must cite `providers.md` "Declared tool policy" and name a finding. It relates two pinned sites instead of pinning a phrase |
| 104feda: aggregation steps read `verdicts["iter-NN"]` "alone, except per … User-resolved findings"; DoD table header admits a user-resolved verdict | a consumer that reads verdicts alone treats a user-resolved CONCERNS/FAIL as blocking forever (external iter-04 #2, high) | static | add (user-resolved test); **red at HEAD → D-3** | Keyed on the claim, not on a hand list of consumers: every canon/README line saying a consumer reads `verdicts["iter-NN"]` alone must carry the user-resolved exception. It also finds `sprint-lifecycle.md` "APPROVE latch" **Invariant** ("DoD or pr-gate aggregation; both read `verdicts["iter-NN"]` alone"), which states the same verdicts-only read with no exception. That is the same class as the fixed workflow lines, not reached by 104feda → D-3. This assert sits last in its test, so the checks before it keep guarding while D-3 is open. Also pinned: the DoD table header cites `sprint-lifecycle.md` "State recovery" for user-resolved verdicts, and the pr gate (the other gating consumer) judges satisfied per "State recovery" |
| `release-manifest.json` hash refresh | stale ledger | static | keep | The existing `upstream_hashes` and `canon_hashes` tests pass |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

Mutations were run with `MUT=./mut7.js node <scratchpad>/mutate.js`: a `git show <sha>~1` revert or an anchor-exact edit, restored in `finally` with a byte compare. `upstream_hashes` noise is not listed; every mutation run exited 1.

| Test | Regression proof |
|---|---|
| tests/run.js:`sprint-018 AC-4/AC-5/AC-7: a reviewer's question and External Review's stalemate …` (refusal clause) | V1: `review-policy.md` reverted to `d62412e~1` → exit 1, "AC-4/AC-5: a reviewer's out-of-policy refusal must become a finding the carrier question names" |
| tests/run.js:`sprint-018 AC-4: a finding the user resolves without a fix is recorded by one resolved: line form …` (verdict-only sweep, DoD header, pr gate) | fail-first at HEAD b343e5a (D-3): "AC-4 (104feda): a line saying a consumer reads verdicts["iter-NN"] alone must carry the user-resolved exception", actual list holding the one `.asd/rules/sprint-lifecycle.md` line "… both read `verdicts["iter-NN"]` alone …". V2/V3: design-review / impl-review reverted to `104feda~1` → exit 1, same assert, whose actual list gains that workflow's aggregation line beside the D-3 line; V4: DoD header carve-out removed → "AC-4: the DoD table says what counts as met, so it must admit a user-resolved verdict with its home" (V1's full revert also hits it); V5: pr step 1 citation changed to "APPROVE latch" → "AC-4: the pr gate, the other gating consumer, must judge satisfied-vs-blocking per State recovery" |

## Suite run

- Command: `node tests/run.js`
- Scope: impacted = full (safety valve: the delta touches `review-policy.md` and `release-manifest.json`)
- Result: fail — 228/229 passed, 1 failed, 0 skipped (exit 1). The one failure is code defect D-3 below: an assertion this entry added, red because canon lacks the contract. The pre-strategy run (step 3) was 229/229, exit 0
- Lint / build: pass — `git diff --check` exit 0; `node .asd/sync.js --check` exit 0, `"ok": true`
- HEAD: b343e5a, worktree carrying this entry's uncommitted `tests/run.js` assertions; they land in the commit that records this run

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/rules/providers.md | AssertionError [ERR_ASSERTION]: AC-4/AC-5: the out-of-policy refusal must route a reviewer through its question carrier - "an agent ... returns `QUESTION`" alone makes a reviewer return a bare QUESTION, which reads as an interrupted dispatch | sprint-018 AC-4/AC-5/AC-7: a reviewer's question and External Review's stalemate ride the verdict-bearing report - one carrier form across template, rule, agents and both review workflows - and impl-review collects manual-verification results before dispatching the testing reviewer | fixed | 0533ef8 |
| D-2 | 1 | .asd/workflows/asd-phase-audit.md | AssertionError [ERR_ASSERTION]: AC-7: every workflow dispatching a role that can return QUESTION must cite the QUESTION protocol, or that question has no handling path in the phase | sprint-018 AC-4/AC-5/AC-7: only the main orchestrator prompts the user - core.md says so, the QUESTION protocol carries every dispatched question, every creator/dev/tester-dispatching workflow cites it, and no agent body, skill or design step hands user contact to a dispatched agent | fixed | 4df9bf4 |
| D-3 | 6 | .asd/rules/sprint-lifecycle.md | AssertionError [ERR_ASSERTION]: AC-4 (104feda): a line saying a consumer reads verdicts["iter-NN"] alone must carry the user-resolved exception - read literally, it blocks a user-resolved CONCERNS/FAIL forever | sprint-018 AC-4: a finding the user resolves without a fix is recorded by one resolved: line form, every resolving site and the review-fix collector cite its one home, and review-fix skips what it names | pending | |
