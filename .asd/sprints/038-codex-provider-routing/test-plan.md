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
| 2 | eaa1003b | delta since entry 1 |
| 3 | | delta since entry 2 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-18 · iteration 2 fix | Git output, wave lists or carryover alter literal path names before scope and patch generation | Component/contract | keep | The existing test now drives the workflow-derived Git command through wave division, NUL output and manifest patch emission. The selectors still accept legacy LF and CRLF lists. The native POSIX branch asserts the literal-backslash patch. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|

## Suite run

- Pre-strategy command: `node tests/run.js contract-agents contract-rules contract-templates contract-workflows runtime-review runtime-routing runtime-timing runtime-tools sync-cli sync-render hooks migrations update` at `1a75a85d`. Exit 0, 314 passed, 0 failed, 0 skipped.
- Entry 2 pre-strategy command: `node tests/run.js runtime-review runtime-routing runtime-timing runtime-tools sync-cli sync-render contract-agents contract-rules contract-templates contract-workflows hooks migrations update` at `03d03af5`. Exit 0, 314 passed, 0 failed, 0 skipped. The full gate remains required because the delta changes shared runtime and sync code.
- Entry 3 pre-strategy command: `node tests/run.js runtime-review contract-workflows contract-rules contract-templates sync-cli sync-render runtime-tools runtime-routing runtime-timing contract-agents hooks migrations update` at `4a1cbcfa`. Exit 0, 314 passed, 0 failed, 0 skipped. The shared list reader and sync ledger still require the full step-8 gate.
- Scope evidence: use the full step-8 gate. `.asd/runtime.js` and `.asd/sync.js` are loaded through shared `tests/lib.js`; changed snapshot, config and release-manifest contracts cross the named areas, including hooks, migrations and update. An isolated area split is unsupported here.
- Command: `node tests/run.js runtime-review contract-workflows contract-rules contract-templates sync-cli sync-render`
- Scope: impacted — six areas, each unfiltered.
- Scope evidence: `runtime-review` drives Git scope and patch generation. The workflow, rule, and template areas check the written handoff. The sync areas cover the shared export and release-ledger changes.
- Result: pass — 162/162 passed, 0 failed, 0 skipped. Windows ran the native Unicode handoff and the POSIX path selector through a preload. The literal-backslash Git patch case runs on native POSIX.
- Lint / build: pass — `git diff --cached --check`; `node .asd/sync.js --check` (77 generated targets current).
- Line delta: tests +213/−19 (net 194); other +907/−340 (net 567)
- HEAD: `4bf4a6ee74d85655cc7efe9affb145a24569dcea` — HEAD matched before and after the run. Relevant code, test and stub paths were clean in the index and worktree, including untracked files.
- Command: `node tests/run.js`
- Scope: full — all test areas, unfiltered.
- Scope evidence: full step-8 safety-valve gate required because the change alters shared `.asd/runtime.js` and `.asd/sync.js` behavior, consumed via `tests/lib.js`, plus cross-area configuration and generated-view contracts.
- Result: pass — 316/316 passed, 0 failed, 0 skipped. Slowest test: sprint-023 AC-2 at 1540 ms.
- Lint / build: pass — `git diff --cached --check`; `node .asd/sync.js --check` (77 generated targets current).
- HEAD: `ac5a555ad23ab5d08da4e54b9c8819ae80ac4cf7` — HEAD matched before and after the run. Relevant code, test and stub paths were clean in the index and worktree, including untracked files.

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
