[REVIEW-impl-external]: CONCERNS

Phase impl-review — sprint 021-deferred-archival-retro-sweep, wave 1, iteration 1. Severity floor: low. Source: codex exec (gpt-6-sol, read-only), one foreground run, no retry.

## Kept findings (3)

| # | Severity | Location | Description | Fix |
|---|---|---|---|---|
| 1 | medium | .asd/runtime.js:670 | The generated-view filter (`isGeneratedView`) drops `.claude/settings.json` and every `.codex/` file. The hook settings are JSON-merge files that can hold user-owned content, and the matching consumer review pathspec excludes them too. Hand-edited settings can therefore escape review. | Exclude only wholly generated paths from both the classifier and the review pathspec. Add checks for user-owned settings. |
| 2 | low | .asd/runtime.js:387 | The new case-insensitive UI classifier (`isUiSurface`) still tests the `.asd/` exception case-sensitively. `.ASD/rules/notes.html` is classified as UI, while `.asd/rules/notes.html` is not. | Normalize the path's case before applying the `.asd/` exception. Add that case to the classifier test. |
| 3 | low | README.md:238 | README says every reviewer writes a return file. `review-policy.md` line 142 says External Review writes none, and the workflow writes its returned text to a scratch file instead. | Limit the return-file statement to internal reviewers. Describe External Review's separate path. |

Codex reported these as: 1 = major → medium, 2 and 3 = minor → low.

## Dropped findings

- Below floor: 0
- Nitpick category: 0

## Verdict

CONCERNS (3: 0 critical, 0 high, 1 medium, 2 low).

## Next action

The phase orchestrator persists this report and routes the 3 findings to the dev.
