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
| 2 | | delta since entry 1 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Review 1 · AC-1–AC-2 | Config validation accepts an opt-out the attribution reader ignores | Component/contract | keep | `runtime-routing` distinguishes the supported disabled form from unsupported spellings. `runtime-tools` and `sync-render` check the downstream attribution behavior. |
| Review 2 · AC-20 | A draft absent from the previous snapshot yields an empty delta | Component/contract | keep | `runtime-review` checks addition patches, changed drafts, and snapshot refusals, plus whole-file carryover and the first-iteration exception. |
| Review 3 · AC-17 | Parsing attribute separators cuts a literal comma from the value | Component/contract | keep | `runtime-timing` checks literal commas with adjacent assignments and repeated flags. |
| Review 4 · AC-18 | A POSIX backslash aliases a different path in external review | Component/contract | keep | `runtime-review` checks path selection on Windows through a POSIX preload and checks the emitted literal-backslash Git patch on native POSIX. |
| Review 5–6 | Comment moves or evidence repairs are mistaken for untested behavior | Static | none | The comment moves preserve executable code. The focused failing commands, checked revisions, and gap proofs are recorded in `test-plan.entry-01.md`. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|

## Suite run

- Pre-strategy command: `node tests/run.js contract-agents contract-rules contract-templates contract-workflows runtime-review runtime-routing runtime-timing runtime-tools sync-cli sync-render hooks migrations update` at `1a75a85d`. Exit 0, 314 passed, 0 failed, 0 skipped.
- Entry 2 pre-strategy command: `node tests/run.js runtime-review runtime-routing runtime-timing runtime-tools sync-cli sync-render contract-agents contract-rules contract-templates contract-workflows hooks migrations update` at `03d03af5`. Exit 0, 314 passed, 0 failed, 0 skipped. The full gate remains required because the delta changes shared runtime and sync code.
- Scope evidence: use the full step-8 gate. `.asd/runtime.js` and `.asd/sync.js` are loaded through shared `tests/lib.js`; changed snapshot, config and release-manifest contracts cross the named areas, including hooks, migrations and update. An isolated area split is unsupported here.
- Command: `node tests/run.js`
- Scope: full — all 316 tests, unfiltered.
- Scope evidence: use the full step-8 gate. `.asd/runtime.js` and `.asd/sync.js` are loaded through shared `tests/lib.js`; changed snapshot, config and release-manifest contracts cross the named areas, including hooks, migrations and update. An isolated area split is unsupported here.
- Result: pass — 316/316 passed, 0 failed, 0 skipped.
- Lint / build: pass — `git diff --cached --check`; `node .asd/sync.js --check` (77 generated targets current).
- Line delta: tests +170/−17 (net 153); other +877/−332 (net 545)
- HEAD: `8a3b8ad51289b430c1ae038bad040768107b49db` — HEAD matched before and after the run. Relevant code, test and stub paths were clean in the index and worktree, including untracked files.

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
