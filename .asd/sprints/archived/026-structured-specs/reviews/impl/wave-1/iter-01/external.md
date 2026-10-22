[REVIEW-impl-external]: CONCERNS

Reviewer: `codex` (gpt-6.1-sol, read-only). Scope: sprint 026, impl-review wave 1, iteration 1, all 18 `files[]` of the manifest. Severity floor: low.

## Kept findings

| # | Severity | Location | Description | Fix | Source |
|---|---|---|---|---|---|
| 1 | high | `.asd/rules/sprint-lifecycle.md:165` | The input-source table always resolves promoted requirements and the UX spec to subsystem paths. With `subsystem_decomposition` disabled, promotion writes `docs/product/requirements.html` and `docs/ux/ux-spec.html` (`artifact-layout.md:78`, `sprint-lifecycle.md:210`). Dispatches then receive requirements paths that don't exist and miss the real UX spec. | Resolve both the requirements and UX paths by decomposition mode, and include the existing flat paths. | `codex`, severity "major", no finding id given |

## Dropped findings

- Below floor: 0
- Nitpick: 0 (wording polish 0, style preference 0, alternative naming 0, speculative future-proofing 0)

## Verdict

CONCERNS: 1 kept finding (high). It is a path-resolution defect in the dispatch input table, not a style issue.

## Next action

Route finding 1 to review-fix. Re-run the review at iteration 2, where the floor rises to medium.
