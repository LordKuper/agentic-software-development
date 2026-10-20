# Test plan entry 08 — sprint 026-structured-specs

Rotated narrative rows of Entry log entry 8; never edited.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `sync.js` exports `VARIANT_SUFFIXES`; `runtime.js` `contextRefs` lazily requires it (2236c70c) | a broken export or require makes every variant role fail to resolve its base grant row | existing `contextRefs` test (§27 GRANT_CASES `asd-dev-critical`) and the real-table sweep over every role-phase pair | none | a missing export makes `new RegExp` throw on `undefined.join`, failing the variant case; mutation not re-run, the failure is a thrown TypeError on a covered path. The added `standard` suffix has no agent file, so an assert on it is a hypothetical risk (`code-style.md` §17) |
| `markdownHeadings` CommonMark fence tracking (2236c70c) | a mis-closed or mis-opened fence hides or invents a heading | existing §27 SECTION_CASES (3 edge cases from the review-fix tester) | none | carried rows rotated to entry 07 pin the three edges with recorded mutations; no new behaviour in the delta |
| Grant table, checkpoints, scope `new` bundle path, core.md trust clause, artifact-layout pointer, D12 reading rule (prose) | prose drift; unresolved ref in a role-phase pair | existing sweep, AC-15 byte caps, AC-16 load test, sync check | none | the sweep resolves every pair of the real table and fails on an unresolved ref; caps and load pins still pass at 296/296 |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | entry 8 delta removes no test | n/a |

## Added tests

| Test | Regression proof |
|---|---|
| none | no new test this entry (see Risk → check decisions) | n/a |
