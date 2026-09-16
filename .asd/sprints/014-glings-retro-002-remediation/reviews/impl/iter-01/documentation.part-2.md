[REVIEW-impl-documentation]: CONCERNS

# Review — documentation (part 2 of 2)

- **Phase**: impl-review
- **Iteration**: 1
- **Manifest**: [documentation.part-2.manifest.json](documentation.part-2.manifest.json)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `.asd/workflows/asd-phase-impl-review.md:25` (1b), `:48` (8); `.asd/workflows/asd-phase-design-review.md:23` (3a), `:41` (9); `.asd/templates/external-review/t_review-report.md:8,15-16` | A skip's `Unreviewed files` are never written. `external-review.md:91` "Iteration semantics" requires a skip iteration to list the whole scope it would have sent, but (a) steps 8/9 defer skip bookkeeping to "Outcome contract", which names only the decisions-log and `F-N` entries; (b) the agent returns the list only for partial/stopped runs (`asd-external-review.md:60`), while a skip is recorded by the orchestrator; (c) impl-review 1b skips all manifest work when non-ready, so the carried-forward set is never computed. `t_review-report.md` token options omit the skip form. A skip iteration's files are never externally reviewed — the AC-1 gap. `tests/run.js:3731` checks only the reading side. | In both workflows' verdict-recording step, after the skip token, write the `Unreviewed files` line from the step-1 scope list unioned with the previous iteration's list; narrow 1b's skip clause to "no manifest is built", keeping the union; add the skip form to `t_review-report.md` or point the rule at a skip-specific `external.md` shape; add a writing-side test. |
| 2 | low | `README.md:313` | Folder map calls rotated segments "dated"; `artifact-layout.md` numbers them (`NNN`, `NN`). | Replace "dated" with "numbered" or drop it. |
| 3 | low | `.asd/skills/asd-sprint/SKILL.md:26` | "Before every phase-skill delegation below: rotate…" overstates `artifact-layout.md:245`, which rotates only when the delegated phase differs from `state.json.phase` and never on resume/re-run; "every" invites rotating on resume and hiding within-phase entries (attempt count, routing line, stalemate answer). | "Before a phase-skill delegation below, rotate the decisions log when `artifact-layout.md` 'Decisions log' requires it." Then sync both `asd-sprint` views. |

## Coverage

```json
{"manifest_digest":"aab0c97cd398bf90e707e76b747939d00f0adbe967b741cd32b067f7afc2de18","findings":["1","2","3"],"files":[{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".asd/templates/external-review/t_review-report.md","s":"checked"},{"i":".asd/templates/t_decisions-log.md","s":"checked"},{"i":".asd/templates/t_plan.md","s":"checked"},{"i":".asd/templates/t_test-plan.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":".asd/workflows/asd-phase-plan.md","s":"checked"},{"i":".asd/workflows/asd-phase-pr.md","s":"checked"},{"i":".asd/workflows/asd-phase-retro.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"SSoT","s":"finding","f":"3"},{"i":"Template adherence","s":"pass"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"finding","f":"2"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"finding","f":"1"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```
