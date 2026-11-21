---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 037-quality-gates-ci-cost-ideas, entry 6 (rotated, never edited)

## Risk → check decisions

Entry 1's rows, removals and added tests moved to `test-plan.entry-01.md`, entry 2's to `test-plan.entry-02.md`, entry 3's to `test-plan.entry-03.md`, entry 4's (the review-fix `wave-1/iter-01` rows) to `test-plan.entry-04.md`, entry 5's (the review-fix `wave-1/iter-02` rows) to `test-plan.entry-05.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `git diff 6104618d...HEAD` outside `.asd/sprints/**`: `checkGapProof` refuses a pipe-less row in `## Added tests` with `Added tests table row lacks a leading pipe` (external 6) | a row typed without its leading pipe is filtered out of the table and never checked, so an empty-proof row closes green | extend `sprint-037 AC-3/AC-13` (`runtime-tools`) with a well-formed table followed by a pipe-less row expecting status 2 and the refusal | extend existing | the AC-3/AC-13 test owns the Gap proof refusals and already holds the valid control (`filled`, status 0). Mutation (the pipe-less `fail` line removed, restored): `node tests/run.js runtime-tools --filter "sprint-037 AC-3/AC-13"` → exit 1, `FAIL - sprint-037 AC-3/AC-13: test-delta splits the sprint diff…` (1/34 matched, 0/1 passed) |
| same function: the placeholder refusal is start-anchored (`cells[column].startsWith('{{')`), so `{{x}} (pending)` is refused and mid-text `{{X}}` still closes (external 7) | a half-replaced template cell with trailing text slips past the whole-cell anchor | extend the same test with a `{{seeded defect}} (pending)` row expecting the placeholder refusal; the mid-text `{{X}}` control from entry 5 stays | extend existing | one assert on the same test. Mutation (`startsWith('{{')` → the whole-cell `/^{{.*}}$/` test, restored): same command → exit 1, same failing test (1/34 matched, 0/1 passed); `git status` after the run shows `.asd/runtime.js` unmodified. runs: 2 (both mutations of this entry) |
| prose changes of `cd79c7ec` and `7c160ef3`: the suite-revision proposed-row route (`asd-phase-impl-test.md` step 9a, `asd-tester.md`), `gh api --hostname <host> --paginate` open-PR number list, `gh auth status --hostname`, the checklist seed after all rows, closing only AC-line `(PR #N)` PRs (`asd-phase-pr.md`) | a machine-parsed token of these steps drifting | none | none | a grep of `tests/contract-*.js` and `tests/runtime-*.test.js` for `gh pr list`, `created-asc`, `gh api`, `auth status`, `--seed`, `(PR #`, `isDraft` hits no pin of any of these tokens; the changes are prose of orchestrator-run `gh` sequences and a dispatch route no machine parses (code-style §17: a prose fix adds a test only for a machine-parsed token) |
| iter-03 memory-fix commits `71b411ea`, `ba739293` and the view sync | none reachable by a test | none | none | agent memory text and generated views; `node .asd/sync.js --check` (`ok: true`) and the full suite cover the views |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Gap proof | Regression proof |
|---|---|---|
