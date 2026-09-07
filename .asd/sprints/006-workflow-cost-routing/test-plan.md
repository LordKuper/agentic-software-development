---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 006-workflow-cost-routing

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | b31ea6dd297a9fc4fc065ea6d13a324878b41b34 | Full implementation diff; shared sync/update/migration harness requires unscoped `node tests/run.js` fallback. |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Compact review ledger | Missing, duplicate, forged `n/a`, or unlinked findings pass | Unit | add | Deterministic validator has security-like completeness semantics. |
| Runtime routing/preflight/cache | Wrong command execution, unsafe probe, stale failure cache, downgrade loop | Unit | add | Pure Node runtime has direct observable contracts. |
| Variant render/sync | Permission drift, collision, invalid metadata | Unit | add | Temp-repo sync plan proves generation and fail-closed branches. |
| PM migration | Consumer-owned or modified generated files deleted | Unit | add | Migration is destructive and idempotence is required. |
| Gate/session prose and workflows | Contract drift | keep | Existing runner and sync/hash checks cover generated views and hooks; no separate prose-only tests. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| None | No existing test is redundant. | yes |

## Added tests

| Test | Regression proof |
|---|---|
| `tests/run.js: compact coverage ledger` | Added after implementation; rejects malformed ledger mutations. |
| `tests/run.js: routing/preflight/cache` | Added after implementation; checks deterministic command routing and bounded local-only failure handling. |
| `tests/run.js: variants and PM migration` | Added after implementation; checks inheritance, collision rejection, and protected deletion. |
| `tests/run.js: wrapped model aliases` | Fail-first observed: renderer emitted literal `{{wraps_model}}`; pending production fix. |

## Suite run

- Command: `node tests/run.js`
- Scope: impacted (unscoped fallback: shared sync/update/migration harness)
- Result: pass — 118/118. Initial run at `b31ea6dd297a9fc4fc065ea6d13a324878b41b34` was 103/111 while implementation and generated views were incomplete; final rerun passed after runtime, sync, manifest, and README repairs.
- Lint / build: pass before impl-test, per impl completion signal; sync/hash checks are included in the passing runner.
- HEAD: d046e01 — final run included the current uncommitted sprint worktree; PR phase must compare its final HEAD before reuse.

## Defects

| ID | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|
| D-1 | `.asd/sync.js` wrapped CLI substitution | Nested `{{wraps_model}}` remained literal in rendered external wrapper. | `AC-3: wrapped model aliases` | fixed | d046e01 |
| D-2 | `.asd/runtime.js` Windows fallback / preflight cache validation | Inspection found shell-sensitive fallback, caller-controlled auth probe, and unbounded retry values; production fix supplied before an automated fail-first run. | Routing/preflight/cache and Windows shim regressions | fixed | d046e01 |

## Manual verification (optional)

| AC | Steps | Expected observation |
|---|---|---|
| AC-3..AC-6, AC-10..AC-12, AC-18..AC-21 | n/a: availability skip is an accepted contract; no live external model request is made for this test pass. | Unit checks validate deterministic helpers and generated contracts only. Independent review must assess model-directed routing and adaptive-gate instructions; local executable/auth probes do not prove model access, quota, or end-to-end dispatch. |
