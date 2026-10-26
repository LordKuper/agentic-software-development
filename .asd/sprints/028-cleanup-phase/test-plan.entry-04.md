# Test plan — sprint 028-cleanup-phase, entry 4 (rotated)

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `tests/run.js` `sprint-028 AC-18` fixture, delta of review-fix wave-1/iter-02: wave 2 split into iter-01 (full roster, resolved `testing: CONCERNS` read from `reviews/impl/wave-2/iter-01`) and iter-02 (lost dispatch, no `documentation`) | a fixture whose only wave-K case was the lost dispatch left the wave-K directory read (`wave-${index + 1}`) unpinned | unit (fixture repo) | keep | the adapted test already covers both cases and carries its fail-first proof (mutation 3, Added tests); no production code changed, no new test |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no test became obsolete by the delta | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| none | n/a: the delta adapts the `sprint-028 AC-18` fixture; its fail-first run (mutation 3) is recorded in `test-plan.entry-03.md` |
