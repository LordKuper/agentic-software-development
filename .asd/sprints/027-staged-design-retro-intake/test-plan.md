---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 027-staged-design-retro-intake

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 9b27aa705f4ac6fa0facb6f7346e67befe48c5cc | full change surface (`git diff main...HEAD`, 43 files, Tasks 1-6) |
| 2 | 81301a214b3b3519a8ce7f14259e7e2c68bc726e | delta `9b27aa70...HEAD` excluding `.asd/sprints` (review-fix wave-1/iter-01, 9 files) |
| 3 |  | delta `81301a21...HEAD` excluding `.asd/sprints` (review-fix wave-2/iter-01, 7 files) |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Review-fix wave-2/iter-01 (CB-1, CB-2, external 1): memory-fix timing in a phase with no step, Exit `writes` attribution, `FAIL` verdict in the low-severity trigger | a `memory-check` hit in scope/audit/design/design-promote has no acting site; Exit `writes` credits `asd-tester` with a memory-fix commit or omits the decisions-log/resolved: lines; a fully resolved `FAIL` plus test-only low findings never reaches the tester | static contract | extend | asserts added to the sprint-027 AC-10 test (home clause, `git-strategy.md` timing, both Exit `writes` lists) and the sprint-020 AC-8 test (trigger token, resolved-`FAIL`-is-satisfied declaration). "Admits `memory-fix`" is already covered by that test's `resolved:` kind sweep, so no new assert |
| Reviewer memory file (`asd-reviewer-combined`) | n/a | none | none | agent memory is not tested; leftover-term sweep over the lines the delta removed found no remaining hit outside the review return scratch file |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no test removed | yes |

## Added tests

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-027 AC-10 home no-step clause and `git-strategy.md` timing | mutation 1 (home loses the no-step clause, superseded text restored): `node tests/run.js --filter "sprint-027 AC-10"` → exit 1, FAIL "sprint-027 AC-10 (D10)…", matched 1/302; mutation 2 (`Memory content check` loses "before that phase's COMPLETED", citation kept): same → exit 1; control (home "such as" → "for example", tokens kept): same → exit 0, matched 1/302; runs: 3 |
| tests/run.js: sprint-027 AC-10 impl-review Exit `writes` attribution and decisions-log entry | mutation (entry back to "asd-tester test-fix and memory-fix commits"): same filter → exit 1, matched 1/302; runs: 1 |
| tests/run.js: sprint-027 AC-10 design-review Exit `writes` memory-fix entry | mutation (entry removed): same filter → exit 1, matched 1/302; runs: 1 |
| tests/run.js: sprint-020 AC-8 trigger `FAIL` verdict short of satisfied | mutation (trigger back to "no `FAIL` verdict", citation dropped): `--filter "sprint-020 AC-8"` → exit 1, FAIL "sprint-020 AC-8: …", matched 1/302; control ("Both workflows," → "Both workflows;", tokens kept): exit 0, matched 1/302; runs: 2 |
| tests/run.js: sprint-020 AC-8 `User-resolved findings` declares a resolved `FAIL` satisfied | mutation (`"FAIL"` removed from the bare-verdict sentence): same filter → exit 1, matched 1/302; runs: 1 |

Not added: the decisions-log "names memory-fix" check for impl-review (folded into the AC-10 row). All mutations ran through `--filter` only via a script that restores the file in a `finally`; `git status` afterwards showed only `tests/run.js` modified.

## Suite run

- Command: `node tests/run.js` (full suite: `tests/run.js` is shared infrastructure)
- Scope: full
- Result: pass — 302/302 passed, exit 0
- Lint / build: pass — `git diff --cached --check` clean; `node .asd/sync.js --check` `ok: true`
- HEAD: 71ec63fc3efa81922129b5308afea1b0e09db1dd (plus this entry's test commit)

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
