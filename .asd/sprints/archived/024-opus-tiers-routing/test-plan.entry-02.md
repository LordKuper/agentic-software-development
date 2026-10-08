# Test plan — sprint 024-opus-tiers-routing, entry 2 (rotated segment, never edited)

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| derived-id routing line `; risk <declaration>` (`providers.md`; mirrored in `t_decisions-log.md`, `asd-phase-impl.md` 5a, `asd-phase-impl-test.md` 1a) | the format SSoT loses the declaration clause or `via <check>`; a mirror's wording drifts | static/arch | none | the SSoT sentence is already pinned by the review-fix tester's `logLine` assert (entry-01 segment, last `Added tests` row); the three mirrors are one-clause restatements pointing at it, and a drifted mirror misleads no router (`route-task` takes the declaration as input, not the log line). No gap |
| review-fix tester's `tests/run.js` strengthening (reserved classes from `runtime.js`, AC-3 inheritance rejection, AC-6 sequencing) | the new pins are vacuous | static/arch | none | mutation proof already recorded in the entry-01 segment; not re-authored |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no review-fix removal row to carry; nothing in the delta stopped earning its keep | yes |

## Added tests

| Test | Regression proof |
|---|---|
| none | entry 2 adds no test; the delta's one risk is already pinned (see `Risk → check decisions`) |
