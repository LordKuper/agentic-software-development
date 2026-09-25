# Test plan — entry 6 (rotated segment)

Rotated from `test-plan.md` at entry 7's strategy pass (`artifact-layout.md` "Test plan" rotation). A cross-span reader reads this segment in ordinal order, then the live file.

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
