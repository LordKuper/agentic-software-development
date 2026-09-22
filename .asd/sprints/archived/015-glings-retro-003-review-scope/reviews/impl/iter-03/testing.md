[REVIEW-impl-testing]: APPROVE

Manifest: [testing.manifest.json](./testing.manifest.json) · Patch: [testing.diff](./testing.diff)

## Findings

None at or above the high floor.

Below the floor, not raised: the `test-plan.md:64` D-1 row still names the AC-11 test by its old title.

## Evidence

- **EXT-4 (AC-11) extension:** it uses the real `reviewerFiles`/`emitCoverageManifests` parts against `surfaceCheck`. The fail-first run at bound 25 with 26 paths was replayed by hand (7 > 6) and matches the recorded message. The default rows stay green, as claimed.
- **Mutations:** the other mutations fail on their intended asserts: overcount, loosening at multiples of 25 only, validation removed, CLI given a NaN value, and the workflow flag.
- **Edge cases:** counts 1, 26 and 53; bounds 1, 24, 25, 26 and 100; invalid 0, -1, 1.5 and NaN.
- **TST-3:** the capture group now spans the full literal, which is present in scope step 3a and the rule.
- **Totals:** 213 tests, no removals, no assert loosened. The `none` memory row is honest. No manual verification is needed.

## Verdict

APPROVE

```json
{"manifest_digest":"e247b6fdb7552ee61ec07e216db13f31b14c5746c08065cf919423ef00b8c659","findings":[],"files":[{"i":"tests/run.js","s":"checked"},{"i":".asd/sprints/015-glings-retro-003-review-scope/test-plan.md","s":"checked"},{"i":".asd/sprints/015-glings-retro-003-review-scope/test-plan.entry-01.md","s":"checked"},{"i":".asd/sprints/015-glings-retro-003-review-scope/test-plan.entry-02.md","s":"checked"},{"i":".asd/sprints/015-glings-retro-003-review-scope/test-plan.entry-03.md","s":"checked"}],"rules":[{"i":"Rule-set conformance","s":"pass"},{"i":"Coverage","s":"pass"},{"i":"Edge cases","s":"pass"},{"i":"Manual verification (last resort)","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```
