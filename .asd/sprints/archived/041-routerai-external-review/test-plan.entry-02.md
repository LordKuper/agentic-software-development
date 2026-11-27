# Test plan evidence — entry 02

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| D-1 README agent roster | A numeric or word-form count disagrees with the actual roster | README template contract | keep | Existing check validates all README count sites. Add the missing `Nine` fixture and retain every assertion. |
| D-2 researcher context ceilings | A fresh seed lacks a required key or silently changes existing values | Context CLI contract | keep | Existing checks cover key membership and value preservation. Compare key membership without imposing an order on JSON object properties. |
| Review finding 1, AC-11 retry context | Preserved payload gets a fresh timing ID and drops known context | Timing CLI contract | add | Extend the existing wave test with a real payload bundle path and distinct timed attempts. The measured bytes remain available and count once. |
| Review finding 2, AC-9/AC-15 worktree identity | Git reports the expected SHA for another worktree | Git CLI boundary contract | add | Extend the existing terminal runner contract with a valid Git directory and an overridden worktree. Verify Git can still report the expected SHA, then require the guard to refuse the run. |
| Review finding 3, AC-1/AC-8/AC-14 wrapper handoff | Wrong shell or arguments, an unnecessary retry, or incomplete carried scope | Actual wrapper dispatch against local CLI fixtures | keep | Two `asd-external-review` dispatches consumed genuine runtime preflight output on Codex/Windows. The RouterAI-profile fixture captured exactly one invocation with argv matching `route.args`, including the pinned provider, model and read-only flags. With the default Claude route, the Codex host used PowerShell even though the wrapped provider was Claude and the fixture captured exactly one invocation. Both stdin inputs contained the manifest path without target contents. Both explicit denials returned `external review interrupted: account-hold`, with no additional wrapped invocation. The orchestrator recorded account hold and persisted a skip whose JSON `Unreviewed files` list exactly matched the two manifest paths. Evidence in `.asd/tmp/041-wrapper-fixture/`: preflight JSON, `invocations.jsonl`, `claude-invocations.jsonl` and `review-output-json/external.md`. This is a controlled agent exercise. It verifies the observed wrapper behavior and does not establish live RouterAI authentication. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| `tests/contract-workflows.test.js`: standalone skill byte-cap assertion | Redundant: survivor `tests/runtime-timing.test.js: context-check exits 0 over the committed ceilings`, branch aggregate standalone skill bytes over the cap | yes — AC-13 |

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|
| `tests/runtime-timing.test.js`: a wave reports separate completion times and counts identical context once | With `NODE_OPTIONS=--require=./.asd/tmp/041-reviewfix-entry1-proof.cjs` and `ASD_041_FIX_PROOF=retry:gap`, discard the supplied bundle path and run the prior case: `node tests/run.js runtime-timing --filter "a wave reports separate completion times"` → exit 0, one match. | Same preload with `retry:regression` and the retry case enabled: `node tests/run.js runtime-timing --filter "a wave reports separate completion times"` → exit 1, one match, `sprint-041 AC-11: a wave reports separate completion times and counts identical context once`. runs: 1 |
| `tests/runtime-tools.test.js`: suite Git check discovers HEAD in the runner environment and rejects an invalid Git directory | With `NODE_OPTIONS=--require=./.asd/tmp/041-reviewfix-entry1-proof.cjs` and `ASD_041_FIX_PROOF=worktree:gap`, remove the root guard and run the prior case: `node tests/run.js runtime-tools --filter "suite Git check discovers HEAD"` → exit 0, one match. | Same preload with `worktree:regression` and the wrong-worktree case enabled: `node tests/run.js runtime-tools --filter "suite Git check discovers HEAD"` → exit 1, one match, `sprint-041 AC-9/AC-15: suite Git check discovers HEAD in the runner environment and rejects an invalid Git directory`. runs: 1 |
