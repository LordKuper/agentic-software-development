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
| 1 | 5854ad90 | full change surface |

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
| Review findings 1–4 and 6 | Existing clients lose attribution opt-out, changed draft patches, timing operations or literal paths | Component/contract | keep | Extend the tests that already own the four contracts and record the failing cases below. The pre-fix script copies use the named commits and the current test files. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|
| `tests/runtime-routing.test.js` / Sprint 038 AC-1/AC-2: config-check requires explicit valid values and names missing, duplicate and invalid keys | The original check had no disabled spelling compared with the attribution reader. The archived runtime accepts quoted disabled with an empty invalid list. | fail-first at 72115d15: `node .asd/tmp/038-codex-provider-routing-proof-before-review/tests/run.js runtime-routing --filter 'config-check requires explicit valid values'` → exit 1, 0/1 passed, named test in first cell. |
| `tests/runtime-review.test.js` / sprint-017 AC-8 (D9e), sprint-038 AC-20: draft-snapshot and emit-manifest patch changed drafts and additions against the prior snapshot | The old snapshot test required no hunk for a missing copy and never requested that case alone. | fail-first at 72115d15: `node .asd/tmp/038-review/tests/run.js runtime-review --filter 'sprint-038 AC-20: draft-snapshot'` → exit 1, 0/1 passed, named test in first cell. |
| `tests/runtime-timing.test.js` / sprint-036 AC-7: timing --open of an id the ledger holds, open or closed, appends nothing and warns with the next free #<n>, a repeat op takes that id, the task_routing lookup strips the #<n>, and a flag given twice warns on stderr with the last value winning | The original mixed-delimiter case used values with no literal commas. | fail-first at 72115d15: `node .asd/tmp/038-codex-provider-routing-proof-before-review/tests/run.js runtime-timing --filter 'sprint-036 AC-7: timing --open'` → exit 1, 0/1 passed, named test in first cell. |
| `tests/runtime-review.test.js` / Sprint 038 AC-18: external review matches its consumer scope and patch across an excluded rename | Slash-only paths did not expose the POSIX path alias. Windows tests the POSIX scope selector through a preload. Native POSIX checks the Git patch with both spellings changed. | fail-first at 72115d15: `node .asd/tmp/038-codex-provider-routing-proof-before-review/tests/run.js runtime-review --filter 'Sprint 038 AC-18: external review matches'` → exit 1, 0/1 passed, named test in first cell. |
| `tests/runtime-tools.test.js` / sprint-033 AC-12/AC-21: commit-check passes a header of at most 50 characters counted as characters, fails a longer one and a memory-check hit among the named staged paths only, ignores a sibling's staged memory hit, and refuses a missing subject | Before Task 14 the test had no staged rename with dirty and unstaged named paths. The archived command reports success on those named paths. | fail-first at 674d2837: `node .asd/tmp/038-codex-provider-routing-proof-before-impl/tests/run.js runtime-tools --filter 'sprint-033 AC-12/AC-21: commit-check passes a header'` → exit 1, 0/1 passed, named test in first cell. |
| `tests/runtime-review.test.js` / Sprint 038 AC-28: a new reviewer-memory hit prevents both review writes | The pre-sprint runtime-review area has no test driving the baseline-to-persistence memory rejection path. | mutation in 72115d15 copy removing the memory check from persist-review: `node .asd/tmp/038-review/tests/run.js runtime-review --filter 'a new reviewer-memory hit prevents both review writes'` → exit 1, 0/1 passed, named test in first cell. |
| `tests/runtime-review.test.js` / AC-1/2: compact coverage ledger rejects identity, completeness, predicate, and finding-reference fraud | The old coverage ledger cases exercised string IDs only. | fail-first at 674d2837: `node .asd/tmp/038-codex-provider-routing-proof-before-impl/tests/run.js runtime-review --filter 'compact coverage ledger rejects identity'` → exit 1, 0/1 passed, named test in first cell. |
| `tests/sync-cli.test.js` / sync.js CLI: --apply on a not-found target and a bare --apply each abort the batch (exit 1) and skip the hash-ledger recompute - manifest and sync-state.json stay byte-for-byte untouched | The old test only checked hash ledgers while invoking apply. It did not check a stale self-hosted ledger before applying. | fail-first at 674d2837: `node .asd/tmp/038-codex-provider-routing-proof-before-impl/tests/run.js sync-cli --filter '--apply on a not-found target'` → exit 1, 0/1 passed, named test in first cell. |
| `tests/runtime-tools.test.js` / sprint-033 AC-27 (issue #109): impl-test-close fills the Entry log HEAD analysed of the named entry with the short HEAD and appends the decisions-log line, touching no other row, and writes neither file when its input is invalid | The old ambiguity check looked at stderr without checking structured refusal fields for the repair dispatch. | fail-first at 674d2837: `node .asd/tmp/038-codex-provider-routing-proof-before-impl/tests/run.js runtime-tools --filter 'sprint-033 AC-27 (issue #109): impl-test-close'` → exit 1, 0/1 passed, named test in first cell. |

## Suite run

- Pre-strategy command: `node tests/run.js contract-agents contract-rules contract-templates contract-workflows runtime-review runtime-routing runtime-timing runtime-tools sync-cli sync-render hooks migrations update` at `1a75a85d`. Exit 0, 314 passed, 0 failed, 0 skipped.
- Scope evidence: use the full step-8 gate. `.asd/runtime.js` and `.asd/sync.js` are loaded through shared `tests/lib.js`; changed snapshot, config and release-manifest contracts cross the named areas, including hooks, migrations and update. An isolated area split is unsupported here.
- Command: `node tests/run.js`
- Scope: full — all 316 tests, unscoped.
- Scope evidence: the safety valve widened the gate because `.asd/runtime.js` and `.asd/sync.js` are shared across the framework's test areas.
- Result: pass — 316/316 passed, 0 failed, 0 skipped.
- Lint / build: pass — `git diff --cached --check`; `node .asd/sync.js --check` (77 generated targets current).
- Line delta: tests +170/−17 (net 153); other +877/−332 (net 545)
- Slowest tests: `sprint-023 AC-2` 1512 ms; `sprint-019 AC-8` 1142 ms; `sprint-036 AC-14` 1107 ms; `sprint-021 AC-7` 1056 ms; `sprint-020 AC-9` 735 ms; `sprint-033 AC-24` 732 ms; `sprint-027 AC-9` 710 ms; `sprint-033 AC-12/AC-21` 707 ms; `sprint-015 AC-4/AC-5` 660 ms; `sprint-017 AC-4/AC-8` 634 ms.
- HEAD: `21eccab7e95fdc8bc6468ed8f648cc5e70432be4` — HEAD and relevant code/test/stub paths were clean and unchanged before and after the run.

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
