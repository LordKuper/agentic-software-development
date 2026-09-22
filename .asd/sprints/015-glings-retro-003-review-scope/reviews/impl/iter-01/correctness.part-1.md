[REVIEW-impl-correctness]: CONCERNS

Manifest: [correctness.part-1.manifest.json](./correctness.part-1.manifest.json) · Patch: [correctness.part-1.diff](./correctness.part-1.diff)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| F-1 | medium | `.asd/runtime.js:382-384` (`isTest`) | The folder check `/(^\|\/)(test\|tests\|__tests__\|spec\|specs)\//` is case-sensitive. It misses `Tests/`, `Test/` and `Spec/`, the convention in Unity and .NET (Glings is Unity). The basename branch catches only some files, not helpers or fixtures (`Assets/Tests/EditMode/Fixture.cs`). Impl-review Testing gets only `isTest` files, so nobody checks those files' test quality. The AC-2/AC-3 test at `tests/run.js:4951` covers only lowercase folders. | Add the `i` flag to the folder regex. Add `Assets/Tests/EditMode/Fixture.cs` to `testFiles`. |
| F-2 | low | `.asd/runtime.js:489-500` (`patchPaths`/`writePatch`), `:510` (`readFileList`) | Step 1's scope list comes from `git diff --name-only` without `-z`. With `core.quotePath`, a non-ASCII path is returned C-quoted, so as a `--literal-pathspecs` pathspec it matches nothing and silently drops out of the `.diff`. Its `rangeRenames` key (from `-z`) never matches either, so a pure rename silently loses its compact row. This undercuts AC-4 for such files. | Produce the step 1 list with `git -c core.quotePath=false diff --name-only -z`, or fail closed when an in-scope path is missing from the range's `--name-only -z` set. |

Checked with no finding:
- `gitRef` rejects a leading `-`. Git runs without a shell, `--literal-pathspecs` is used and paths go after `--`.
- `rangeRenames` steps through the `-z` tokens correctly, and purity needs the same blob and the same mode.
- `validate-ledger` enforces `n_a.files`.
- `surfaceCheck`'s upper bound matches the canon wording.
- The per-sprint skip references resolve.
- The C-4 rewrite is user-accepted.
- Design testability is unowned by plan decision.
- 11.0.0 carries a no-migration note.

AC trace: this part carries evidence for AC-1, 2, 3, 4, 5, 7, 8, 9, 11 and 12. The only partial is the F-2 gap in AC-4.

## Verdict
CONCERNS: 2

## Next action
- F-1: make the folder match case-insensitive and add a test case.
- F-2: the orchestrator picks the fix (unquoted `-z` scope list or a fail-closed path check); `asd-dev` implements it.
- Re-hash the ledger afterwards.

```json
{"manifest_digest":"044dbc1637a5ffe524fc2d82560cbb003ec457c18e11d55b85a4ced8ecc2ac3a","findings":["F-1","F-2"],"files":[{"i":".asd/agents/asd-architect.md","s":"checked"},{"i":".asd/agents/asd-external-review.md","s":"checked"},{"i":".asd/agents/asd-reviewer-correctness.md","s":"checked"},{"i":".asd/agents/asd-reviewer-documentation.md","s":"checked"},{"i":".asd/agents/asd-reviewer-efficiency.md","s":"checked"},{"i":".asd/agents/asd-reviewer-testing.md","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/checkpoints.md","s":"checked"},{"i":".asd/rules/core.md","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"finding","f":"F-1"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"finding","f":"F-2"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"}]}
```
