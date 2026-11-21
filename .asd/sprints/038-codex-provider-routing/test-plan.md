---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec
  excludes: task breakdown, requirements, review verdicts, code, change surface
  delegates_to: plan.md (tasks), sprint.md (requirements), reviews/impl/ (verdict)
---

# Test plan — sprint 038-codex-provider-routing

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | | full change surface |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-1–AC-2, AC-4–AC-5 | Sprint enters on an incomplete config or review runs with the primary provider | Component/contract | keep | `runtime-routing` exercises valid, missing, duplicate and invalid config; fake CLI verifies separate profile flags, availability, fingerprint and default routing. Read the quickstart against the profile contract. Authenticated RouterAI verification is conditional on credentials. |
| AC-3, AC-15 | Mockup setting skips UX preconditions or an interrupted publication repeats | Static workflow trace | none | Follow the approved draft and success/deferred markers from scope to promotion, including the reachability and unknown-result branches. The framework consumes these as instructions. A text assertion does not exercise the canvas host. |
| AC-6, AC-12, AC-21 | Model, quota override or timeout changes the wrong role or leaves the process detached | Component/contract | keep | `sync-cli`, `sync-render`, `contract-agents` and `contract-templates` cover generated role settings and invocation tokens. A host-confirmed quota event depends on live model availability. |
| AC-7, AC-18–AC-20, AC-28 | Wrapped verdict loses material findings, review leaks excluded scope or invalid output is written | Component/contract | keep | `runtime-review` covers severity floor, consumer and self-hosting manifests, coverage IDs, snapshot refusal and reviewer-owned memory. The accepted plan's synthetic wrapper and failed-runner smokes complement those assertions. |
| AC-8, AC-11, AC-14, AC-16, AC-23, AC-26 | Future phase misses a blocking prerequisite, contract edge or sibling mechanism | Static workflow trace | none | Trace each requirement at its planning, audit or fix-dispatch step. These branches are prose for the orchestrator. Existing workflow shape checks cover the machine-parsed parts. |
| AC-9–AC-10, AC-13, AC-22, AC-27, AC-29–AC-30 | Interrupted work looks green, a wrong tree receives credit or a refusal loses its owner | Component/contract | keep | `runtime-tools` covers pipe cells, entry and added-test validation and precise refusals; `contract-agents`, `contract-templates` and `contract-workflows` check runner and plan handoffs. Trace reuse, area invalidation, repair scope and prose-only eligibility against the workflow. |
| AC-17, AC-24–AC-25 | Repeated timing attributes drop evidence, stale ledgers pass or named paths commit partially | Component/contract | keep | `runtime-timing`, `runtime-tools` and `sync-cli` cover merge, commit path and stale-ledger outcomes. `hooks`, `migrations` and `update` exercise consumers of the live sync and hash changes. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|

## Suite run

- Pre-strategy command: `node tests/run.js contract-agents contract-rules contract-templates contract-workflows runtime-review runtime-routing runtime-timing runtime-tools sync-cli sync-render hooks migrations update` at `1a75a85d`. Exit 0, 314 passed, 0 failed, 0 skipped.
- Scope evidence: use the full step-8 gate. `.asd/runtime.js` and `.asd/sync.js` are loaded through shared `tests/lib.js`; changed snapshot, config and release-manifest contracts cross the named areas, including hooks, migrations and update. An isolated area split is unsupported here.

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
