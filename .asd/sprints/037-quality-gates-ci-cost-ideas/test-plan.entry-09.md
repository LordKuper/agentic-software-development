---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 037-quality-gates-ci-cost-ideas, entry 9 (rotated, never edited)

## Risk → check decisions

Entry 1's rows, removals and added tests moved to `test-plan.entry-01.md`, entry 2's to `test-plan.entry-02.md`, entry 3's to `test-plan.entry-03.md`, entry 4's (the review-fix `wave-1/iter-01` rows) to `test-plan.entry-04.md`, entry 5's (the review-fix `wave-1/iter-02` rows) to `test-plan.entry-05.md`, entry 6's (the review-fix `wave-1/iter-03` rows) to `test-plan.entry-06.md`, entry 7's (the review-fix `wave-1/iter-04` rows) to `test-plan.entry-07.md`, entry 8's (the review-fix `wave-1/iter-05` rows) to `test-plan.entry-08.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `git diff b00f83b9...HEAD` outside `.asd/sprints/**`: `2129602e` prose — `asd-phase-impl-test.md` step 4 re-entry rotates first, then writes each review-fix removal request as a live `Removed tests` row; the one permitted segment edit (`artifact-layout.md` Rotation, `asd-phase-impl-test.md` "Rules") covers any `Added tests` refusal `impl-test-close` names | a machine-parsed token drifting | none | none | prose of the Tester's re-entry order and repair scope; no `runtime.js` parser reads either phrase. The only pins reaching them hold: `sprint-014 AC-7` (`contract-workflows`) checks the `test-plan.entry-NN.md` rotation token in canon, and `sprint-037 AC-3/AC-13` / the rotated-segment Gap proof test (`runtime-tools`) already own `impl-test-close`'s refusal of any `Added tests` row in a segment; the impacted set ran green (code-style §17: a prose fix adds a test only for a machine-parsed token) |
| `.asd/release-manifest.json` hash refresh for the two files above | none reachable by a test | none | none | hashes; the manifest hash tests (`update` area) and `node .asd/sync.js --check` (`ok: true`) cover them |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Gap proof | Regression proof |
|---|---|---|
