[REVIEW-impl-documentation]: CONCERNS

Manifest: [documentation.part-1.manifest.json](./documentation.part-1.manifest.json) · Patch: [documentation.part-1.diff](./documentation.part-1.diff)

## Findings

| ID | Severity | Location | Description |
|---|---|---|---|
| D-1 | high | `.asd/runtime.js:452` (`surfaceCheck` body) | New in-body comment `// ponytail: Testing's extra part holds up to SPLIT_THRESHOLD_FILES test-plan paths ...`. `code-style.md` §7 bans in-body comments except `// TODO(sprint-<NNN-slug>): <reason>`, and framework code is not exempt. The note records a real limit, so move the reason into `surfaceCheck`'s member doc and delete the in-body line. Alternatively, take the test-plan path count as input. |
| D-2 | low | `.asd/rules/checkpoints.md` gate-class table, row "change-surface cap override (…; request states the bound's `dispatches` from `surface-check`)" | Duplicates the fact that `sprint-lifecycle.md` "Plan file format" › Change surface declaration now owns, and which `checkpoints.md` already cites. Cut the parenthetical so the row gives only the gate class. |

Passed:
- The owner map matches the agent descriptions (AC→code Correctness, AC→check Testing, stub resolution → Documentation, design testability unowned, External row points to `external-review.md`).
- The table matches `reviewerFiles`, `isTest` and `assertReviewerUnion`.
- The emit-manifest usage line and the "Pure-rename row" paragraph match the runtime.
- The DoD roster matches.
- The per-sprint skip is in the hard list.
- No clear-context instruction remains. C-4 is applied.
- The README roster reflects Testing's narrowing and the stub move.
- The release manifest is 11.0.0, and the hash entries move together (checked by structure only).
- There are no sprint TODO markers in this part.
- The dependency custom rule does not cover `runtime.js`.

## Verdict

CONCERNS: 1 high, 1 low.

## Next action

impl review-fix: move the D-1 reason into the member doc and cut the D-2 parenthetical.

```json
{"manifest_digest":"56130a27d8b1801b0d1df0be2d7ecf4b36c02e0a2d1ceb3a3144f3fcfc488685","findings":["D-1","D-2"],"files":[{"i":".asd/agents/asd-architect.md","s":"checked"},{"i":".asd/agents/asd-external-review.md","s":"checked"},{"i":".asd/agents/asd-reviewer-correctness.md","s":"checked"},{"i":".asd/agents/asd-reviewer-documentation.md","s":"checked"},{"i":".asd/agents/asd-reviewer-efficiency.md","s":"checked"},{"i":".asd/agents/asd-reviewer-testing.md","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/checkpoints.md","s":"checked"},{"i":".asd/rules/core.md","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"}],"rules":[{"i":"SSoT","s":"finding","f":"D-2"},{"i":"Template adherence","s":"n/a","p":"no templated artefact in scope"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"finding","f":"D-1"},{"i":"Stub-resolution verification (impl-review)","s":"n/a","p":"evidence outside this part; covered by the other parts"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"pass"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```
