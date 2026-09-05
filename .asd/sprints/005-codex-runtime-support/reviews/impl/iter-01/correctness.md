[REVIEW-impl-correctness]: CONCERNS

## Findings

| ID | Severity | Location / AC | Description | Fix |
|---|---|---|---|---|
| F-1 | low | `.asd/sync.js:356`; `tests/run.js:159-166`; AC-2, AC-6, AC-7 | `codexSkillText` has no trailing standalone-token boundary. Root-relative paths such as `/asd-sprint/usage` and `/asd-sprint.md` are rewritten to `$asd-sprint/usage` and `$asd-sprint.md`. Existing preservation tests cover nested paths and URLs only. | Restrict replacement when the captured command is followed by a path/file continuation such as `/` or `.`, then add regression assertions for both examples. |

Coverage summary: 19/19 scoped files, all applicable rules, and 6/6 rubric sections resolved.

N/A: UI/accessibility — no UI surface in scope; design-system, UX, design-only custom rules — outside phase gate.
