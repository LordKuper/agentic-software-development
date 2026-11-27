---
responsibility:
  owns: test decisions, test results and defects
  excludes: task breakdown, requirements, verdicts and code
  delegates_to: impl-review
---

# Test plan — sprint 042-external-review-apps

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 44e8a23b | full change surface |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Named-profile Codex review (AC-1, AC-2) | Missing or incorrectly split CLI override with apps enabled in the named profile | `runtime-routing` named-profile test | keep | Task 2 extends the existing route contract assertion. It failed against the pre-fix runtime because the override was absent, and the current test checks the full argv and unchanged default Claude route. |
| Review docs and release hashes (AC-3) | Instructions disagree with the argument contract or updated content leaves stale hashes | Review the named-profile instructions in `README.md` and `.asd/rules/external-review.md`, run sync validation and existing contract tests | none | The edit adds ordinary prose. The existing argument test covers the machine contract and sync validates the refreshed hashes. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|

Task 2 extended an existing test in `f7d40238`; entry 1 added no tests.

Pre-strategy run at `7ba87bbf`: `node tests/run.js runtime-routing runtime-tools runtime-review contract-workflows contract-templates contract-rules contract-agents sync-render sync-cli hooks update` exited 0, 282/282 passed. No stale temporary tests were found.

## Suite run

- Scope evidence: `.asd/runtime.js` changes only named-profile External Review argv. The docs explain that route and `.asd/release-manifest.json` refreshes two content hashes. The changed behavior does not reach runner setup, timing, migration logic, or unrelated review commands. The named areas from the pre-strategy run exercise the route plus related runtime, documentation, sync, hook, and release hash contracts.
- Command: `node tests/run.js`
- Scope: full — unscoped runner invocation; full suite completed.
- Result: pass — 331/331 passed, 0 failed.
- Lint / build: pass — `git diff --cached --check` / `node .asd/sync.js --check`.
- Slowest tests: 1324 ms sprint-023 AC-2; 1129 ms sprint-036 AC-14; 1061 ms sprint-021 AC-7; 983 ms sprint-019 AC-8; 808 ms sprint-017 AC-8; 796 ms sprint-038 AC-1/AC-2; 773 ms sprint-020 AC-9; 751 ms sprint-027 AC-9; 736 ms sprint-033 AC-32; 718 ms sprint-014 AC-2.
- HEAD: `1363427698bd8b2d47d8a29411226f99d4b8c00b`.
- Line delta: tests +6/−4 (net 2); other +7/−5 (net 2)

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
