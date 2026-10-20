---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 025-operation-timing

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 1f7a5c9ba688fe33f16c66b5be22da27c061faff | full change surface |
| 2 | 957ae941e19571d31bd0573ca3bb0eba125d30e6 | delta since entry 1 |

## Risk → check decisions

Entry 2 pre-strategy run: delta (`2f15dbb`, `b65766a`) touches `.asd/runtime.js`, `release-manifest.json`, rule docs and workflows (shared framework files), so the safety valve degraded the impacted set to the full suite: `node tests/run.js` → 279/280, the one failure the known-red `sprint-025 AC-5 (D5, D6): timingSummary …` pin.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `runtime.js` `slowOps`: machine time (user-wait overlap subtracted), parent-based leaf (external 1, 2; supersedes the entry-1 `timingSummary` slow-set pin's fixture) | a long user wait inflates a dispatch's rank or excess; a dispatch with a child suite is ranked next to its own child; parallel siblings dropped | unit on fixed ledgers (new test plus the adapted `timingSummary` pin) | add + keep (adapted) | the old pin's wait overlapped `dev-0`, so the fix correctly dropped it: a test defect, not a code defect; the wait moved to a window with no dispatch |
| `runtime.js` `timingAppend` phase reopen guard (C1) | a second `--open <phase>` while the bare name is open writes a second open and double-counts the phase | unit | add | pure function, fixed ledger |
| `sprint-lifecycle.md` "Operation timing" wording, workflow timing lines, asd-sprint "Phase ops", README (C2-C7) | prose reworded; no parsed token, heading, command or field name changed beyond what the entry-1 binding pin already holds | none | none | §17 forbids pinning surrounding prose; the entry-1 contract pins (kinds line derived from the rule, every workflow's `"Operation timing"` binding, README commands) stay green |

## Removed tests

None.

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| `tests/run.js`: sprint-025 AC-5 (D5, D6) the slow set ranks machine time … (new) | mutations: wait subtraction zeroed in `slowOps`; leaf filter removed (`leaves = machine`); phase reopen guard removed in `timingAppend`: each `node tests/run.js` → exit 1, `sprint-025 AC-5 (D5, D6): the slow set ranks machine time with user-wait overlap subtracted …`; runs: 3 |
| `tests/run.js`: sprint-025 AC-5 (D5, D6) timingSummary … (adapted fixture) | pre-adapt run against the fixed `slowOps`: exit 1, `sprint-025 AC-5 (D5, D6): timingSummary reports totals …` (dev-0 correctly dropped); adapted pin green; runs: 1 |

Parallel-sibling eligibility is asserted in the new test (`x`, `y` both listed) and is not separately mutated. Every mutation was restored in the same command; `git status` shows only the committed files.

## Suite run

- Command: `node tests/run.js`
- Scope: full (terminal suite, impl-review wave-1/iter-02)
- Result: pass — exit 0; 281 passed, 0 failed, 0 skipped
- Lint / build: pass — `git diff --cached --check` exit 0, `node .asd/sync.js --check` exit 0 (all targets current)
- HEAD: cb7b3eeafe10cb43a02f60c0246859538b3e53a3

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|

## Manual verification (optional)

None. Every behaviour is automatable; the `update.js` network path is unverified by a test and is recorded above as a residual risk.
