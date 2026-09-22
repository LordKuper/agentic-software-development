[REVIEW-impl-testing]: CONCERNS

Manifest: [testing.manifest.json](./testing.manifest.json) · Patch: [testing.diff](./testing.diff)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| TST-3 | medium | `tests/run.js:5145-5147` (sprint-015 AC-8 assert); `test-plan.md` row "`asd-phase-scope.md` step 3a … (e3a8801, P2-3)" (`keep`) | The `keep` row is wrong. The regex `/"<doc> (skipped this sprint by user)"/` captures only the suffix, and the pre-fix step 3a text still contains that suffix. Reverting the P2-3/DOC-2 fix therefore leaves the suite green. The row claims coverage it does not have, the assert message's "verbatim" is false, and the fix has no fail-first proof (§17). | Change the capture to `/"(<doc> skipped this sprint by user)"/`, record the mutation in `Added tests`, and change the row to `extended`. |

## Checks passed

- 213 tests = 211 + 2, and the entry-3 HEAD matches the dispatch line.
- Every iter-01 fix id has an honest row, except P2-3/DOC-2 (TST-3).
- The draft-snapshot mutations (traced by hand) match the record.
- The F-2 canon-command test is honest.
- The P2-1 and P2-2 asserts match canon.
- The entry-02 items hold, and TST-2 is resolved.
- No manual verification is needed. The custom rules pass.

## Verdict
CONCERNS: 1

```json
{"manifest_digest":"86c7ca8f60c411b2bdd2665d14b613f4b149b23438ecff6485200bbebef240f0","findings":["TST-3"],"files":[{"i":"tests/run.js","s":"checked"},{"i":".asd/sprints/015-glings-retro-003-review-scope/test-plan.md","s":"checked"},{"i":".asd/sprints/015-glings-retro-003-review-scope/test-plan.entry-01.md","s":"checked"},{"i":".asd/sprints/015-glings-retro-003-review-scope/test-plan.entry-02.md","s":"checked"}],"rules":[{"i":"Rule-set conformance","s":"finding","f":"TST-3"},{"i":"Coverage","s":"pass"},{"i":"Edge cases","s":"pass"},{"i":"Manual verification (last resort)","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```
