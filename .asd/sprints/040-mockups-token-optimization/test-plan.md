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
- Command: `node tests/run.js` (configured `test_durations`; unscoped)
- Scope: full
- Scope evidence: The configured duration command is the unscoped full suite command; every test file ran without an area or name filter.
- Result: pass, exit 0. 326/326 passed.
- Lint / build: `git diff --cached --check` — pass, exit 0; `node .asd/sync.js --check` — pass, exit 0 (all generated sync items current).
- Smoke: not configured.
- HEAD: 372a94acc8c6ecda8632a11329615262c4f9c523 (confirmed unchanged before and after).
- Slowest tests: sprint-023 AC-2 branch sync — 1164 ms; sprint-036 AC-14 agent-liveness returned review — 1084 ms; sprint-021 AC-7 agent-liveness transcript states — 1040 ms; sprint-019 AC-8 scoped commit command — 819 ms; sprint-017 AC-8 draft-snapshot / emit-manifest diff — 552 ms; sprint-033 AC-12/AC-21 commit-check — 518 ms; sprint-027 AC-9 runner filter — 493 ms; sprint-017 AC-4/AC-8 emit-manifest full range — 492 ms; sprint-020 AC-9 persist-review — 490 ms; sprint-038 AC-1/AC-2 and sprint-040 AC-1 config-check — 481 ms.
- Provenance: `suite impl-review#2` under dispatch `impl-review terminal suite retry`. The prior `suite impl-review#1` run reported 323/326 because child Git commands were denied; retry triage confirmed those tests pass with per-invocation `safe.directory` environment variables and no code change. This run set those variables only in its PowerShell process, verified `git check-attr whitespace -- README.md`, and passed 326/326. Smoke is not configured.
- Allowance: Entry 3 covers the AC-1 and AC-2 zero-write migration retry and dry preview, linked installed-config refusal at both entry points, and default and explicit CLI input on the supported Node floor. The added fixture lines exercise those boundaries through the actual CLIs and the release migration.
- Line delta: tests +359/−43 (net 316); other +894/−888 (net 6)
- Release candidate: v14.12.0 at 80b2a505a577c835f2586fe219691f7a5fbf2d1b passed the same unscoped command 326/326 (exit 0) in suite pr#1. Lint, all 77 sync statuses and context ceilings passed. The terminal suite above verifies the reviewed source revision.


## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
