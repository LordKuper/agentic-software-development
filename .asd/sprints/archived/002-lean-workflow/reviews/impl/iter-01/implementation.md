[REVIEW-impl-implementation]: CONCERNS

# Review — implementation

- **Phase**: impl-review
- **Iteration**: 1

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `.asd/rules/artifact-layout.md:159` | "Test plan" section still says test-plan.md is "overwritten each impl-test entry" — contradicts the amend-not-rewrite rule Task 17 landed in four other homes. | Replace with "entry 1 writes fresh; every re-entry amends it". |
| 2 | medium | `.asd/rules/sprint-lifecycle.md:228` | `archived_at` documented as set by pr's merge-mode step; it's actually set by open-mode step 6 (pre-merge archival). | Correct the writer attribution. |
| 3 | medium | `.asd/agents/asd-reviewer-documentation.md:4` (frontmatter description) | Description still claims the AC→code trace twice ("PRD AC ↔ ADR ↔ code", "traceability across PRD/ADR/UX/code") after Task 19 narrowed the rubric to drop it. | Drop `↔ code`/`/code` from both spots; re-sync. |
| 4 | medium | `.asd/templates/external-review/t_prompt-external-design.md:48,49,52` | External design prompt's PRD rubric still requires Problem/Goals/Non-goals the sprint draft no longer carries (Task 7). | Mark Problem optional, scope Goals/Non-goals to the persistent doc only. |
| 5 | low | `.asd/templates/t_state.json` | Task 13's "document the slot" subtask didn't land — no comment/description of the `"skipped: <predicate>"` value in the JSON file itself. | Repoint the two referencing sites at `sprint-lifecycle.md` "State recovery". |
| 6 | low | `.asd/templates/t_config.yaml:39-49` | `review.scoped_fan_out` field lands with no AC-4 evidence entry in Task 13's affected-files line. | Add the file to Task 13's affected-files line. |

## Coverage summary (internal reviewers only)

**Summary**: `files: 59/59 checked, 0 n/a · rules: 3/3, 6 findings`

**n/a rows**: none.

**Findings rows**:
| Rubric item | Finding |
|---|---|
| No AC implemented partially without explicit follow-up | finding #1, #2, #3, #4, #5 |
| No code change without traceable AC or plan Task | finding #6 |

## Verdict
CONCERNS: 6

## Next action
Route to `impl` review-fix mode; all six are text corrections inside already-approved verdict scope.

## Escalations
None.
