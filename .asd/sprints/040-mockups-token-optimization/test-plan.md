---
responsibility:
  owns: test approach, suite evidence and defects
  delegates_to: plan.md (tasks), sprint.md (acceptance)
---

# Test plan — sprint 040

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | be1c83b2 | full change surface |
| 2 | 17dae23b | delta since entry 1 |
| 3 | bcc7edda | delta since entry 2 |
| 4 | 7ee837fe | delta since entry 3 |
| 5 | 05e1d71f | delta since entry 4 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-2 · Update completion write route | The approval menu can exist while the write branch loses the decision guard or stops using the missing-settings diagnostic. | Existing `update` content-contract and CLI regression | none | Review-fix commit `1f9b5cf` already checks the leading `accept-all` route and exact `missing` field separately in step 3. Each missing token failed the targeted test and the rewording control passed. The trace from `asd-update` step 5 through `asd-init` step 3 to the core settings-write invariant confirms the approved-missing-only write authority. |
| AC-5, AC-6, AC-8 · Installed skill integrity | The canonical skill, provider views, release hashes or standalone context limit may drift after the repair. | Existing skill, rules, template, release and sync contracts, plus context-check | none | The skill shape, canonical references, live standalone byte limit, updated hash entries and current generated views are already checked. The 22 measured Codex phase bundles still match their probe inputs, as recorded in the review-fix handoff. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

No tests were removed or proposed for removal.

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|

Entry 5 added no tests. The review-fix extension and its proofs are in [entry 4](./test-plan.entry-04.md#added-tests).

## Suite run

- Pre-strategy evidence: The initial seven-area run passed 175/175 (`suite impl-test#18`). The complete selection below added `contract-templates` after tracing its canonical Markdown scan, and ran before strategy. The complete run is eligible for the impacted gate because this entry needs no test edits.
- Command: `node tests/run.js contract-agents contract-rules contract-templates contract-workflows runtime-timing sync-cli sync-render update`
- Scope: impacted
- Scope evidence: The enabled safety valve bounds the delta to the init approval clause, its content-contract test and the corresponding views and release hashes. `contract-agents`, `contract-rules` and `contract-templates` scan canonical skills. `contract-workflows` reads this skill and checks the standalone cap. `runtime-timing` verifies enforcement at the cap boundary. `sync-cli`, `sync-render` and `update` exercise release and sync checks, and `update` runs both the repaired contract and CLI retry. Shared runtime, sync and test setup are outside the delta.
- Result: pass, exit 0. 189 passed, 0 failed, 0 runner-level skips. Four existing Windows fixture branches bypassed file-symlink assertions.
- Lint / build: pass. `git diff --cached --check` and `node .asd/sync.js --check` exited 0. All 77 sync targets are current. `node .asd/runtime.js context-check` reported no exceeded ceilings.
- HEAD: 9eb5a8ec562230421cf95387f033a14388fc96ca
- Provenance: `suite impl-test#19` under dispatch `impl-test entry 5 strategy`. HEAD matched before and after. Relevant source, generated views, agent memory, tests and stubs were clean, including untracked files. No smoke command is configured.
- Allowance: Entry 3 covers the AC-1 and AC-2 zero-write migration retry and dry preview, linked installed-config refusal at both entry points, and default and explicit CLI input on the supported Node floor. The added fixture lines exercise those boundaries through the actual CLIs and the release migration.
- Line delta: tests +359/−43 (net 316); other +894/−888 (net 6)

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
