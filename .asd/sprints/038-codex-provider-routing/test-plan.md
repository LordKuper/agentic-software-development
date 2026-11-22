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

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Review 1 · AC-1–AC-2 | Config validation accepts an opt-out the attribution reader ignores | Component/contract | keep | `runtime-routing` distinguishes the supported disabled form from unsupported spellings. `runtime-tools` and `sync-render` check the downstream attribution behavior. |
| Review 2 · AC-20 | A draft absent from the previous snapshot yields an empty delta | Component/contract | keep | `runtime-review` checks addition patches, changed drafts, and snapshot refusals, plus whole-file carryover and the first-iteration exception. |
| Review 3 · AC-17 | Parsing attribute separators cuts a literal comma from the value | Component/contract | keep | `runtime-timing` checks literal commas with adjacent assignments and repeated flags. |
| Review 4 · AC-18 | A POSIX backslash aliases a different path in external review | Component/contract | keep | `runtime-review` checks path selection on Windows through a POSIX preload and checks the emitted literal-backslash Git patch on native POSIX. |
| Review 5–6 | Comment moves or evidence repairs are mistaken for untested behavior | Static | none | The comment moves preserve executable code. The focused failing commands, checked revisions, and gap proofs are recorded in `test-plan.entry-01.md`. |
| Wave 1 iteration 2 finding 1 · AC-18 | Git quoting or the wave handoff changes a path before patch generation | Component/contract | keep | Extend the scope command contract through real Git output, wave files, and manifest emission. Exercise the production command with a literal backslash on POSIX and retain legacy LF and CRLF list coverage. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|
| `tests/runtime-review.test.js` / sprint-015 AC-4 (F-2), sprint-038 AC-18: Git scope paths reach the wave manifest and patch verbatim | The existing scope command test stopped at stdout. The existing AC-18 selector test wrote the literal path directly. Neither test exercised the Git-to-wave-to-manifest handoff. | `node .asd/tmp/038-review-paths-pre-fix/tests/run.js runtime-review --filter 'Git scope paths reach the wave manifest'` matched 1/45 on each run. Runtime at `4064683e` rejected the NUL in the Git argument (exit 1, 0/1). Restoring the old Git scope step left the scratch list absent (exit 1, 0/1). Removing the new wave `--nul` clause produced LF output (exit 1, 0/1). Rewording adjacent prose passed (exit 0, 1/1). The runner named the test in the first cell. Runs: 4. |

## Suite run

- Pre-strategy command: `node tests/run.js contract-agents contract-rules contract-templates contract-workflows runtime-review runtime-routing runtime-timing runtime-tools sync-cli sync-render hooks migrations update` at `1a75a85d`. Exit 0, 314 passed, 0 failed, 0 skipped.
- Entry 2 pre-strategy command: `node tests/run.js runtime-review runtime-routing runtime-timing runtime-tools sync-cli sync-render contract-agents contract-rules contract-templates contract-workflows hooks migrations update` at `03d03af5`. Exit 0, 314 passed, 0 failed, 0 skipped. The full gate remains required because the delta changes shared runtime and sync code.
- Scope evidence: use the full step-8 gate. `.asd/runtime.js` and `.asd/sync.js` are loaded through shared `tests/lib.js`; changed snapshot, config and release-manifest contracts cross the named areas, including hooks, migrations and update. An isolated area split is unsupported here.
- Command: `node tests/run.js`
- Scope: full — all 316 tests, unfiltered.
- Scope evidence: use the full step-8 gate. `.asd/runtime.js` and `.asd/sync.js` are loaded through shared `tests/lib.js`; changed snapshot, config and release-manifest contracts cross the named areas, including hooks, migrations and update. An isolated area split is unsupported here.
- Result: pass — 316/316 passed, 0 failed, 0 skipped.
- Lint / build: pass — `git diff --cached --check`; `node .asd/sync.js --check` (77 generated targets current).
- Line delta: tests +213/−19 (net 194); other +907/−340 (net 567)
- HEAD: `8a3b8ad51289b430c1ae038bad040768107b49db` — HEAD matched before and after the run. Relevant code, test and stub paths were clean in the index and worktree, including untracked files.

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
