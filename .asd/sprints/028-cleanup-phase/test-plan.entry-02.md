# Test plan — sprint 028-cleanup-phase, entry 2 (rotated)

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-17 escalation consult, delta: `asd-phase-impl-review.md` steps 8, 10 (gate-marked) and 7a, 11 (no gate marker), Owner line, Dispatch row (supersedes the entry 1 AC-17 row) | a user escalation asked at a step without the advisor consult | contract | keep | `sprint-028 AC-17` scans every workflow step holding a failure- or question-class `[GATE hard: …]` marker: steps 8 and 10 were the D-1 sites and now pass (313/313 pre-strategy); no new test |
| AC-17 sites without a gate marker: impl-review step 7a second interruption and step 11 FAILED/QUESTION relay | the consult missing at a site no scan reaches | none | none | the sites carry no stable token to derive them from (only prose: "second consecutive interruption", "FAILED → relay"); a pin would lock wording or a hand list, which §17 forbids; the same relay lines in `asd-phase-impl-test.md` 11, `asd-phase-design.md` 13 and `asd-phase-design-review.md` 11 carry it by the same one-clause edit, quality review judges the prose |
| `.asd/release-manifest.json` hash for the edited workflow | stale `upstream_hashes` entry | contract | keep | the existing release-manifest integrity test (hashes match the files) is green after D-1's refresh |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no test became obsolete by the delta | yes |

## Added tests

| Test | Regression proof |
|---|---|
| none | n/a: D-1's regression is pinned by `sprint-028 AC-17`, whose fail-first run is recorded in `test-plan.entry-01.md` |
