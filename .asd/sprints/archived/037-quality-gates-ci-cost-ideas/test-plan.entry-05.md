---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 037-quality-gates-ci-cost-ideas, entry 5 (rotated, never edited)

## Risk → check decisions

Entry 1's rows, removals and added tests moved to `test-plan.entry-01.md`, entry 2's to `test-plan.entry-02.md`, entry 3's to `test-plan.entry-03.md`, entry 4's (the review-fix `wave-1/iter-01` rows) to `test-plan.entry-04.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `git diff 7e8c5385...HEAD` outside `.asd/sprints/**`: `context-check --seed` into an existing ceilings file keeps every existing key and value and adds only the missing project keys; a malformed file fails (combined F1 / external 4) | a re-seed raises a lowered ceiling or drops a key, or a malformed file is overwritten | extend `sprint-037 AC-1` (`runtime-timing`) with a seed into a file holding a lowered ceiling and one missing project key, and a seed into a malformed file | extend existing | the AC-1 test owns the context-check exit contract and the seed; the added case expects the lowered value kept, the other keys untouched, the missing key added, and the malformed file non-zero and unchanged. Mutation (`const existing = fs.existsSync(file) ? readCeilings(file) : {};` → `const existing = {};`, restored): `node tests/run.js runtime-timing --filter "sprint-037 AC-1"` → exit 1, `FAIL - sprint-037 AC-1: context-check exits 0 over the committed ceilings…` (1/21 matched, 0/1 passed) |
| `checkGapProof` refuses only a wholly unreplaced `{{…}}` Gap proof cell (anchored), so a proof citing `{{X}}` mid-text closes (combined F2 / external 6) | the placeholder check refuses a real proof that quotes a template token | extend `sprint-037 AC-3/AC-13` (`runtime-tools`) with a mid-text `{{X}}` control row expecting status 0 | extend existing | the AC-3/AC-13 test owns the Gap proof refusals; the whole-cell placeholder case was already there, the mid-text control is the new row. Mutation (anchors dropped, `/^{{.*}}$/` → `/{{.*}}/`, restored): `node tests/run.js runtime-tools --filter "sprint-037 AC-3/AC-13"` → exit 1, `FAIL - sprint-037 AC-3/AC-13: test-delta splits the sprint diff…` (1/34 matched, 0/1 passed) |
| `checkGapProof` refuses an Added tests table whose header is followed directly by a data row (external 5) | a table with no separator row swallows its first data row as the separator and closes green | extend `sprint-037 AC-3/AC-13` (`runtime-tools`) with a header-then-row plan expecting the `table separator malformed` refusal | extend existing | same owner test. Mutation (separator-shape `fail` line removed, restored): `node tests/run.js runtime-tools --filter "sprint-037 AC-3/AC-13"` → exit 1, same failing test (1/34 matched, 0/1 passed) |
| PR intake and merge prose: host-qualified `<project>` (`gh repo view <origin> --json url`), `--match-head-commit <sha>`, `headRefOid`, oldest-first listing (external 1–3) | a machine-parsed token of these steps drifting | none | none | no contract test pins any of these tokens (`grep -n "nameWithOwner|headRefOid|match-head-commit|created-asc" tests/` was empty after the dead helper below was removed); the change is prose of an orchestrator-run `gh` sequence no machine parses (code-style §17: a prose fix adds a test only for a machine-parsed token) |
| `originCheckedBeforeRepoView` in `tests/contract-workflows.test.js` still named `nameWithOwner` and nothing called it | a dead helper pinning a replaced token | none (deletion) | removed | the helper and `labelsAdded`, also uncalled since before entry 4, are deleted from `tests/contract-workflows.test.js`; no test referenced either |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Gap proof | Regression proof |
|---|---|---|
