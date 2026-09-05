[REVIEW-impl-correctness]: CONCERNS

## Findings

| ID | Severity | Location / AC-N | Description | Fix |
|---|---|---|---|---|
| C-1 | medium | `.asd/sync.js:356`; AC-2, AC-4 | The trailing boundary excludes only lowercase letters, digits, hyphens, `/`, and `.`. Uppercase and underscore suffixes remain accepted, so path-like tokens such as `/asd-sprintGuide` and `/asd-sprint_guide` are partially rewritten. The prior root-relative-path defect is therefore only partially fixed. | Make the trailing boundary symmetrical with the leading word boundary, e.g. `(?=$|[^.\w/-])`, and add preservation assertions for uppercase and underscore suffixes. |

Coverage summary: 3/3 scoped files, 11/11 applicable rules, and 6/6 sections resolved.

N/A: UI conformance, design-system, and UX rules — no UI surface in scope.
